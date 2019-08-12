const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const ora = require('ora');
console.log(chalk.cyan('  Start compressing files.\n'));
var output = fs.createWriteStream(
  path.resolve(__dirname, './build/build.zip')
);
var archive = require('archiver')('zip', {
  zlib: { level: 9 } 
});

output.on('close', function() {
  console.log(chalk.yellow('  ' + archive.pointer() + ' total bytes'));

  var conn = new (require('ssh2')).Client(),
    SERVER = {
      DIR: '/www/wwwroot/listen.666xyz.xyz',
      HOST: '666xyz.xyz',
      PORT: '22',
      USER_NAME: 'root',
      //   PSSWORD: '',
      PRIVATE_KEY: fs.readFileSync(`${require('os').homedir()}/.ssh/id_rsa`)
    },
    localPath = `${SERVER.DIR}/build.zip`,
    remotePath = SERVER.DIR;
  conn
    .on('ready', function() {
      conn.exec(
        `mv ${remotePath}/build.zip ${remotePath}/build.zip.bak`, 
        function(err, stream) {
          if (err) throw err;
          conn.sftp(function(err, sftp) {
            if (err) throw err;
            const loading = ora('Uploading...');
            sftp.fastPut(
              path.resolve(__dirname, './build/build.zip'), 
              localPath,
              {
                step(total_transferred, chunk, total) {
                  if (total_transferred < total) {
                    loading.start();
                  }
                }
              },
              function(err) {
                loading.stop();
                if (err) throw err;
                conn.exec(
                  `cd ${remotePath} && rm -rf static *.js && unzip -o build.zip`,
                  function(err, stream) {
                    if (err) throw err;
                    stream
                      .on('close', function(code, signal) {
                        console.log(chalk.cyan('  deploy completed.\n'));
                        conn.end();
                      })
                      .on('data', function(data) {});
                  }
                );
              }
            );
          });
        }
      );
    })
    .connect({
      host: SERVER.HOST,
      port: SERVER.PORT,
      username: SERVER.USER_NAME,
      privateKey: SERVER.PRIVATE_KEY
    });
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);
archive.directory(path.resolve(__dirname, './build/'), false, function(
  entryData
) {
  return entryData.name === 'build.zip' ? false : entryData; //过滤不需要压缩的文件
});
archive.finalize();
