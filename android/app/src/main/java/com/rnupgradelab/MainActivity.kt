package com.rnupgradelab

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "RNUpgradeLab"

  /**
   * Returns the instance of the [ReactActivityDelegate]. The New Architecture is always on, so the
   * old fabricEnabled flag is gone (passing it is deprecated in 0.87).
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName)
}
