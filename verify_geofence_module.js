// 验证地理围栏模块注册
const { NativeModules } = require('react-native');

console.log('=== 地理围栏模块验证 ===');
console.log('可用原生模块:', Object.keys(NativeModules));

if ('GeofenceModule' in NativeModules) {
  console.log('✅ GeofenceModule 注册成功');

  const GeofenceModule = NativeModules.GeofenceModule;
  console.log('模块方法:', Object.getOwnPropertyNames(GeofenceModule));
} else {
  console.error('❌ GeofenceModule 未注册');
  console.error('这可能是由于：');
  console.error('1. 模块未在 MainApplication 中正确注册');
  console.error('2. 应用需要重新构建');
}

console.log('==================');
