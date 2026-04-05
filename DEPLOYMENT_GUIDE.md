# QuizItNow Production Deployment Guide

## Server Information
- **Server IP**: 145.79.14.209
- **SSH Username**: u803669722
- **Domain**: quizitnow.com

## Deployment Steps

### Step 1: Prepare the Server (SSH Access Required)

Connect to your server via SSH:
```bash
ssh u803669722@145.79.14.209
```

Then run the following commands as root:

```bash
# Become root
sudo su -

# Create application directory
mkdir -p /root/quizitnow
cd /root/quizitnow

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git curl wget

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx

# Create log directory
mkdir -p /var/log/quizitnow
chmod 755 /var/log/quizitnow
```

### Step 2: Upload Application Files

Use FileZilla, WinSCP, or SCP to upload the built files:

```bash
# On your local machine (Windows)
# Use WinSCP or FileZilla to connect to:
# Host: 145.79.14.209
# Username: u803669722
# Password: [Your SSH Password]

# Upload the .next/ folder and node_modules to /root/quizitnow/
# Or upload all files and run: npm install --production && npm run build
```

**Recommended approach**: Upload the entire built project:

```bash
# From local machine, create a tar file
tar -czf quizitnow.tar.gz .next/ public/ package.json package-lock.json ecosystem.config.js nginx.conf

# Upload via SCP (if available on your system)
scp -r quizitnow.tar.gz u803669722@145.79.14.209:/root/

# On server, extract
cd /root
tar -xzf quizitnow.tar.gz -C quizitnow/
```

### Step 3: Configure Environment Variables

On the server:

```bash
cd /root/quizitnow

# Create .env.production file
cat > .env.production << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mqetlxzfhvfwodrfqidw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZXRseHpmaHZmd29kcmZxaWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODcxMDksImV4cCI6MjA5MDk2MzEwOX0.xfc5jjzUd9V5oyxNUccdeDx5j0RCYQbd0JFKNJ7cU30
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyClGM6ysSsXzj4GQQ3-4BMQok7iQpbQuB0
NODE_ENV=production
EOF
```

### Step 4: Install Dependencies and Build

```bash
cd /root/quizitnow

# Install production dependencies
npm install --production

# Build the application
npm run build
```

### Step 5: Set Up PM2

```bash
cd /root/quizitnow

# Start the application with PM2
pm2 start npm --name "quizitnow" -- start

# Save PM2 configuration
pm2 save

# Make PM2 start on boot
pm2 startup
# Copy and run the generated command

# Monitor application
pm2 logs quizitnow
pm2 status
```

### Step 6: Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
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

    # SSL certificates (will be created in next step)
    ssl_certificate /etc/letsencrypt/live/quizitnow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quizitnow.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
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
        proxy_buffering off;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
ENDNGINX

# Enable the site
sudo ln -sf /etc/nginx/sites-available/quizitnow /etc/nginx/sites-enabled/quizitnow

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Point Domain to Server

Update your domain DNS records (at your domain registrar):

```
A Record:
Name: @
Value: 145.79.14.209

CNAME Record:
Name: www
Value: quizitnow.com
```

**Allow 24 hours for DNS propagation**.

### Step 8: Set Up SSL Certificate

Once DNS is pointing to your server:

```bash
# Run Certbot to automatically set up SSL
sudo certbot certonly --nginx -d quizitnow.com -d www.quizitnow.com

# Follow the prompts (choose email, agree to terms)

# Reload Nginx with new certificate
sudo systemctl reload nginx
```

### Step 9: Verify Deployment

```bash
# Check application is running
pm2 status
pm2 logs quizitnow

# Check Nginx is working
sudo systemctl status nginx

# Test with curl
curl https://quizitnow.com

# Check SSL certificate
openssl s_client -connect quizitnow.com:443
```

## Post-Deployment Maintenance

### Monitor Application
```bash
# View logs in real-time
pm2 logs quizitnow

# Monitor CPU and memory
pm2 monit

# List all PM2 processes
pm2 list
```

### Database Migrations
```bash
# If you need to run database migrations
cd /root/quizitnow
npm run migrate
```

### Restart Application
```bash
# Restart the app
pm2 restart quizitnow

# Stop the app
pm2 stop quizitnow

# Start the app
pm2 start quizitnow
```

### Update Application
```bash
cd /root/quizitnow

# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Restart
pm2 restart quizitnow
```

### View Server Logs
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PM2 application logs
pm2 logs quizitnow
```

## Troubleshooting

### Application won't start
```bash
# Check if port 3000 is in use
netstat -tlnp | grep 3000

# Kill process on port 3000 if needed
lsof -i :3000
kill -9 <PID>

# Try starting again
pm2 restart quizitnow
```

### Nginx connection refused
```bash
# Check Nginx is running
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx configuration
sudo nginx -t
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

### Database connection issues
```bash
# Check environment variables
cat /root/quizitnow/.env.production

# Verify Supabase project is accessible
curl https://mqetlxzfhvfwodrfqidw.supabase.co/rest/v1/
```

## Support
For issues, check:
1. PM2 logs: `pm2 logs quizitnow`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Supabase dashboard for database status
4. Google AI Studio for API key validity
