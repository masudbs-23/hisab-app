const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing jcenter() deprecation in gradle files...');

// Fix react-native-get-sms-android
const smsGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-get-sms-android',
  'android',
  'build.gradle'
);

if (fs.existsSync(smsGradlePath)) {
  let content = fs.readFileSync(smsGradlePath, 'utf8');
  if (content.includes('jcenter()')) {
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    fs.writeFileSync(smsGradlePath, content, 'utf8');
    console.log('✅ Fixed react-native-get-sms-android/android/build.gradle');
  }
}

// Fix react-native-sqlite-storage
const sqliteGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-sqlite-storage',
  'platforms',
  'android',
  'build.gradle'
);

if (fs.existsSync(sqliteGradlePath)) {
  let content = fs.readFileSync(sqliteGradlePath, 'utf8');
  if (content.includes('jcenter()')) {
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    fs.writeFileSync(sqliteGradlePath, content, 'utf8');
    console.log('✅ Fixed react-native-sqlite-storage/platforms/android/build.gradle');
  }
}

console.log('✅ Gradle fixes completed!');

