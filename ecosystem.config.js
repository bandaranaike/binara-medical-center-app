module.exports = {
    apps: [
        {
            name: 'app.binara.live',
            script: 'npx',
            args: 'next start',
            env: {
                NODE_ENV: 'production',
                PORT: 3003,
            },
        },
    ],
};