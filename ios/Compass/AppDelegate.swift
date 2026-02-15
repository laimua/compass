import UIKit
import React

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {

    let moduleName = "Compass"

    // 创建 React Native bridge
    let rootView = RCTRootView(bundle: nil, moduleName: moduleName, initialProperties: nil)

    // 设置根视图控制器
    window = UIWindow(frame: UIScreen.main.bounds)
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()

    return true
  }

  func applicationWillTerminate(_ application: UIApplication) {
    // App 即将被终止，保存状态（如果需要）
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    // App 变为活动状态
  }

  func applicationWillResignActive(_ application: UIApplication) {
    // App 即将变为非活动状态
  }
}
