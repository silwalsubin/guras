import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseMessaging
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {
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

    // Set up push notifications
    setupPushNotifications(application)

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

  // MARK: - Push Notification Setup

  private func setupPushNotifications(_ application: UIApplication) {
    // Set up notification center delegate
    UNUserNotificationCenter.current().delegate = self

    // Set up Firebase Messaging delegate
    Messaging.messaging().delegate = self

    // Request notification permissions
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
      print("📱 Notification permission granted: \(granted)")
      if let error = error {
        print("❌ Notification permission error: \(error)")
      }

      DispatchQueue.main.async {
        if granted {
          application.registerForRemoteNotifications()
        }
      }
    }
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

  // MARK: - UNUserNotificationCenterDelegate

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    print("📱 Received notification while app is in foreground")
    // Show notification even when app is in foreground
    completionHandler([.alert, .badge, .sound])
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    print("📱 User tapped on notification")
    let userInfo = response.notification.request.content.userInfo

    // Handle notification tap
    handleNotificationTap(userInfo: userInfo)

    completionHandler()
  }

  // MARK: - MessagingDelegate

  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("📱 FCM registration token: \(fcmToken ?? "nil")")

    if let token = fcmToken {
      // Store token for later use
      UserDefaults.standard.set(token, forKey: "FCMToken")

      // Notify React Native about the new token
      NotificationCenter.default.post(
        name: NSNotification.Name("FCMTokenReceived"),
        object: nil,
        userInfo: ["token": token]
      )
    }
  }

  // MARK: - Notification Handling

  private func handleNotificationTap(userInfo: [AnyHashable: Any]) {
    print("📱 Handling notification tap with userInfo: \(userInfo)")

    // Send notification data to React Native
    NotificationCenter.default.post(
      name: NSNotification.Name("NotificationTapped"),
      object: nil,
      userInfo: userInfo
    )
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
