# QuizItNow Quick Deploy Instructions

## What You Need:
- **SSH Access**: u803669722@145.79.14.209 (Password: KiaraSilpa@123$)
- **WinSCP or FileZilla** (for uploading files)
- **Domain**: quizitnow.com (needs DNS configuration)

## Quick Steps (15 minutes)

### 1️⃣ Prepare Server (SSH)

Open Terminal/PuTTY and run:

```bash
ssh u803669722@145.79.14.209
```

Then:

```bash
# Become root
sudo su -

# Create app directory
mkdir -p /root/quizitnow && cd /root/quizitnow

# Update system and install Node.js
apt-get update && apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs git nginx certbot python3-certbot-nginx

# Install PM2
npm install -g pm2

# Create log directory
mkdir -p /var/log/quizitnow
```

### 2️⃣ Upload Build Files

**Option A: Using WinSCP**
1. Open WinSCP
2. Connect to:
   - Host: `145.79.14.209`
   - Username: `u803669722`
   - Password: `KiaraSilpa@123$`
3. Navigate to `/root/quizitnow/`
4. Drag and drop the entire `quizitnow-build.tar.gz` file

**Option B: Using SSH (if you have sshpass on Mac/Linux)**
```bash
scp quizitnow-build.tar.gz u803669722@145.79.14.209:/root/
```

### 3️⃣ Extract and Deploy

Still in your SSH session:

```bash
cd /root

# Extract the package
tar -xzf quizitnow-build.tar.gz -C quizitnow/

# Navigate to app
cd quizitnow

# Install dependencies
npm install --production

# Start with PM2
pm2 start npm --name "quizitnow" -- start
pm2 save
pm2 startup

# Copy and run the generated command from above
```

### 4️⃣ Configure Nginx

Still in SSH:

```bash
# Copy the nginx config (it's already in the tar file)
sudo cp nginx.conf /etc/nginx/sites-available/quizitnow

# Enable it
sudo ln -sf /etc/nginx/sites-available/quizitnow /etc/nginx/sites-enabled/quizitnow
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5️⃣ Configure DNS

Go to your domain registrar (wherever you registered quizitnow.com) and add:

```
A Record:
Name: @
Value: 145.79.14.209

CNAME Record:
Name: www
Value: quizitnow.com
```

**⏳ Wait 15-30 minutes for DNS propagation**

### 6️⃣ Get SSL Certificate

Once DNS is working:

```bash
sudo certbot certonly --nginx -d quizitnow.com -d www.quizitnow.com
# Follow the prompts

# Reload Nginx
sudo systemctl reload nginx
```

### 7️⃣ Verify Everything Works

```bash
# Check app is running
pm2 status

# View logs
pm2 logs quizitnow

# Test with curl
curl https://quizitnow.com
```

## Troubleshooting

**App won't start?**
```bash
pm2 logs quizitnow  # Check the error
npm run build       # Rebuild if needed
pm2 restart quizitnow
```

**Nginx issues?**
```bash
sudo nginx -t       # Check config syntax
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

**Can't find files after extraction?**
```bash
cd /root/quizitnow
ls -la  # Should see .next, app, components, etc.
```

## Success! 🎉

Your application is now running at:
- **http://quizitnow.com** (redirects to HTTPS)
- **https://quizitnow.com** ✅

## Keep It Running

**Monitor it:**
```bash
pm2 monit
```

**View real-time logs:**
```bash
pm2 logs quizitnow
```

**Restart on update:**
```bash
cd /root/quizitnow
git pull origin main
npm run build
pm2 restart quizitnow
```

---

**Questions?** Check the full DEPLOYMENT_GUIDE.md for detailed information.
