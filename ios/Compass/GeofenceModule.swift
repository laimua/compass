import Foundation
import CoreLocation
import UIKit
import React

@objc(GeofenceModule)
class GeofenceModule: NSObject, RCTBridgeModule, CLLocationManagerDelegate {
    static func moduleName() -> String! {
        return "GeofenceModule"
    }

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    private let locationManager = CLLocationManager()
    private var resolve: RCTPromiseResolveBlock?
    private var reject: RCTPromiseRejectBlock?

    override init() {
        super.init()
        locationManager.delegate = self
    }

    @objc
    func checkSupport(_ resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
        resolve(["supported": true])
    }

    @objc
    func registerGeofences(_ geofences: [[String: Any]],
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
        // 移除所有现有的地理围栏
        for region in locationManager.monitoredRegions {
            locationManager.stopMonitoring(for: region)
        }

        // 添加新的地理围栏（最多20个）
        let maxCount = min(20, geofences.count)
        for i in 0..<maxCount {
            let gf = geofences[i]
            if let id = gf["id"] as? String,
               let latitude = gf["latitude"] as? Double,
               let longitude = gf["longitude"] as? Double,
               let radius = gf["radius"] as? Double {

                let center = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
                let region = CLCircularRegion(center: center, radius: radius, identifier: id)
                region.notifyOnEntry = (gf["notifyOnEntry"] as? Bool) ?? false
                region.notifyOnExit = (gf["notifyOnExit"] as? Bool) ?? false

                locationManager.startMonitoring(for: region)
            }
        }

        resolve(nil)
    }

    @objc
    func removeAll(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
        for region in locationManager.monitoredRegions {
            locationManager.stopMonitoring(for: region)
        }
        resolve(nil)
    }

    // CLLocationManagerDelegate
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        if let circularRegion = region as? CLCircularRegion {
            sendEvent("GeofenceEnter", id: region.identifier)
        }
    }

    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        if let circularRegion = region as? CLCircularRegion {
            sendEvent("GeofenceExit", id: region.identifier)
        }
    }

    // 监听失败 - 发送错误事件到 JavaScript
    func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
        let errorMessage = error.localizedDescription
        let regionId = region?.identifier ?? "unknown"
        sendErrorEvent(message: errorMessage, region: regionId)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        sendErrorEvent(message: error.localizedDescription, region: "location_manager")
    }

    // 使用新的 React Native 事件发送 API
    private func sendEvent(_ eventName: String, id: String) {
        if let bridge = self.bridge {
            bridge.eventDispatcher().sendEvent(withName: eventName, body: ["id": id])
        }
    }

    private func sendErrorEvent(message: String, region: String) {
        if let bridge = self.bridge {
            bridge.eventDispatcher().sendEvent(withName: "GeofenceError", body: [
                "error": message,
                "region": region
            ])
        }
    }
}
