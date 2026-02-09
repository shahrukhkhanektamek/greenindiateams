package com.greenindiateams

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages
    )
  }

  override fun onCreate() {
    super.onCreate()

    // 🔔 CREATE NOTIFICATION CHANNELS
    createNotificationChannels()

    loadReactNative(this)
  }

  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      val manager = getSystemService(NotificationManager::class.java)

      val audioAttributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()

      // 🔹 OTHER ZONE
      val otherZoneChannel = NotificationChannel(
        "booking_other_zone",
        "Booking Other Zone",
        NotificationManager.IMPORTANCE_HIGH
      )
      otherZoneChannel.setSound(
        Uri.parse("android.resource://$packageName/raw/other_zone"),
        audioAttributes
      )

      // 🔹 SAME ZONE
      val sameZoneChannel = NotificationChannel(
        "booking_same_zone",
        "Booking Same Zone",
        NotificationManager.IMPORTANCE_HIGH
      )
      sameZoneChannel.setSound(
        Uri.parse("android.resource://$packageName/raw/working_zone"),
        audioAttributes
      )

      // 🔹 ALERT
      val alertChannel = NotificationChannel(
        "alert_channel",
        "Alert Notifications",
        NotificationManager.IMPORTANCE_HIGH
      )
      alertChannel.setSound(
        Uri.parse("android.resource://$packageName/raw/alert"),
        audioAttributes
      )

      manager.createNotificationChannel(otherZoneChannel)
      manager.createNotificationChannel(sameZoneChannel)
      manager.createNotificationChannel(alertChannel)
    }
  }
}
