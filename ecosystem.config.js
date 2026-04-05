module.exports = {
  apps: [
    {
      name: 'quizitnow',
      script: 'npm',
      args: 'start',
      cwd: '/root/quizitnow',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/quizitnow/error.log',
      out_file: '/var/log/quizitnow/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
  deploy: {
    production: {
      user: 'root',
      host: '145.79.14.209',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/quizitnow.git',
      path: '/root/quizitnow',
      'post-deploy':
        'npm install && npm run build && pm2 restart ecosystem.config.js --env production',
    },
  },
};
