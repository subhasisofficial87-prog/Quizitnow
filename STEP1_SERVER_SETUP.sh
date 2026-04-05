#!/bin/bash
# QuizItNow Step 1: Complete Server Setup Script
# Copy and paste this entire script into your SSH terminal

set -e

echo "================================"
echo "QuizItNow Server Setup - Step 1"
echo "================================"
echo ""

# Become root
sudo su - << 'ROOTEOF'

echo "Step 1/7: Updating system..."
apt-get update && apt-get upgrade -y
echo "✅ System updated"
echo ""

echo "Step 2/7: Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git curl wget
echo "✅ Node.js installed: $(node -v)"
echo ""

echo "Step 3/7: Installing PM2 globally..."
npm install -g pm2
echo "✅ PM2 installed: $(pm2 -v)"
echo ""

echo "Step 4/7: Installing Nginx..."
apt-get install -y nginx
echo "✅ Nginx installed"
systemctl enable nginx
echo ""

echo "Step 5/7: Installing Certbot for SSL..."
apt-get install -y certbot python3-certbot-nginx
echo "✅ Certbot installed"
echo ""

echo "Step 6/7: Creating application directory..."
mkdir -p /root/quizitnow
cd /root/quizitnow
chmod 755 /root/quizitnow
echo "✅ Directory created at /root/quizitnow"
echo ""

echo "Step 7/7: Creating log directory..."
mkdir -p /var/log/quizitnow
chmod 755 /var/log/quizitnow
echo "✅ Log directory created"
echo ""

echo "================================"
echo "✅ STEP 1 COMPLETE!"
echo "================================"
echo ""
echo "Server is ready. Next steps:"
echo "1. Upload quizitnow-build.tar.gz to /root/"
echo "2. Extract: tar -xzf /root/quizitnow-build.tar.gz -C /root/quizitnow/"
echo "3. Install: cd /root/quizitnow && npm install --production"
echo "4. Start: pm2 start npm --name 'quizitnow' -- start"
echo ""

ROOTEOF

echo "All done! Proceed to Step 2."
