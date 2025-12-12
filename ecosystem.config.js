module.exports = {
    apps: [
        {
            name: "app.binara.live",
            cwd: "/var/www/app.binara.live",
            script: "node_modules/.bin/next",
            args: "start -p 3001",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};