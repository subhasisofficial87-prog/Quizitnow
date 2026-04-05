#!/bin/bash

# QuizItNow Deployment Script for Hostinger
# This script will deploy the application to production

set -e

echo "================================"
echo "QuizItNow Production Deployment"
echo "================================"

# Server details
SERVER_IP="145.79.14.209"
SSH_USER="u803669722"
APP_DIR="/root/quizitnow"
APP_NAME="quizitnow"

echo ""
echo "Step 1: Connecting to server..."
echo "Server: $SERVER_IP"
echo "User: $SSH_USER"

# Deploy via SSH
ssh -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP << 'ENDSSH'

echo "Step 2: Creating application directory..."
sudo mkdir -p /root/quizitnow
cd /root/quizitnow

echo "Step 3: Installing Node.js and dependencies..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git curl wget

echo "Step 4: Installing PM2 globally..."
sudo npm install -g pm2

echo "Step 5: Installing Nginx..."
sudo apt-get install -y nginx

echo "Step 6: Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx

echo "Step 7: Cloning/updating repository..."
if [ -d ".git" ]; then
    git pull origin main
else
    echo "Repository not yet cloned - you will need to manually setup git or provide repo URL"
fi

echo "Step 8: Installing Node dependencies..."
npm install --production

echo "Step 9: Building application..."
npm run build

echo "Step 10: Creating log directory..."
sudo mkdir -p /var/log/quizitnow
sudo chown -R $USER:$USER /var/log/quizitnow

echo "Step 11: Starting application with PM2..."
pm2 delete quizitnow || true
pm2 start npm --name "quizitnow" -- start
pm2 save
sudo env PATH=$PATH:/usr/local/bin pm2 startup -u $USER --hp /root

echo "Step 12: Setting up Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/quizitnow > /dev/null << 'ENDNGINX'
upstream quizitnow {
    least_conn;
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name quizitnow.com www.quizitnow.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name quizitnow.com www.quizitnow.com;

    ssl_certificate /etc/letsencrypt/live/quizitnow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quizitnow.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://quizitnow;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
ENDNGINX

sudo ln -sf /etc/nginx/sites-available/quizitnow /etc/nginx/sites-enabled/quizitnow
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. Configure DNS for quizitnow.com to point to 145.79.14.209"
echo "2. Run: sudo certbot certonly --nginx -d quizitnow.com -d www.quizitnow.com"
echo "3. Reload Nginx: sudo systemctl reload nginx"
echo ""
echo "Check application status:"
echo "  pm2 status"
echo "  pm2 logs quizitnow"
echo ""

ENDSSH

echo "✅ Remote deployment script completed!"
