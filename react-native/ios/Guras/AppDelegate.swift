import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseMessaging

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Initialize Firebase
    do {
      FirebaseApp.configure()
      print("✅ Firebase configured successfully")
    } catch {
      print("❌ Firebase configuration failed: \(error)")
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Guras",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
  
  // MARK: - Push Notification Methods
  
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    print("📱 APNS Device Token received: \(deviceToken.map { String(format: "%02.2hhx", $0) }.joined())")
    
    // Set the APNS token for Firebase
    Messaging.messaging().apnsToken = deviceToken
    print("✅ APNS token set for Firebase")
  }
  
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("❌ Failed to register for remote notifications: \(error)")
  }
  
  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    print("📨 Received remote notification: \(userInfo)")
    completionHandler(.newData)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    // Temporarily use Metro for testing - change back to main.jsbundle for production
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    // Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
