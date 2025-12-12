module.exports = {
    apps: [
        {
            name: "app.binara.live",
            script: "pnpm",
            args: "start",
            cwd: "/var/www/app.binara.live",
            interpreter: "none",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};
