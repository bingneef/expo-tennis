module.exports = function (shipit) {
  require('shipit-deploy')(shipit)
  require('shipit-pm2')(shipit)
  require('shipit-yarn')(shipit)
  require('shipit-shared')(shipit)

  shipit.initConfig({
    default: {
      workspace: 'tmp',
      deployTo: '/var/www/tennis-api',
      repositoryUrl: 'git@github.com:bingneef/expo-tennis.git',
      ignores: ['.git', 'node_modules', 'public/assets/news-item'],
      keepReleases: 10,
      shallowClone: true,
      dirToCopy: '',
      yarn: {
        remote: true,
      },
      shared: {
        overwrite: false,
        files: [
          'app.json'
        ],
        dirs: [
          'public/assets/news-item',
        ]
      }
    },
    production: {
      branch: 'master',
      servers: 'bing@5.157.85.46'
    },
  })
}


