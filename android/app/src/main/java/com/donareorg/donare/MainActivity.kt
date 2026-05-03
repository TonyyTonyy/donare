package com.donareorg.donare

import android.content.pm.ApplicationInfo
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.PermissionRequest
import android.webkit.PermissionRequest.RESOURCE_VIDEO_CAPTURE
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.donareorg.donare.ui.theme.DonareTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(true)

        if (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        enableEdgeToEdge()
        setContent {
            DonareTheme {
                // Surface garante que o WebView ocupe a tela inteira sem paddings do Scaffold
                Surface(modifier = Modifier.fillMaxSize()) {

                    //WebViewScreen(url = "http://192.168.3.10:3000")
                    WebViewScreen(url = "https://donare-gamma.vercel.app/")
                }
            }
        }
    }
}


@Composable
fun WebViewScreen(url: String, modifier: Modifier = Modifier) {
    AndroidView(factory = {
        WebView(it).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            clearCache(true)
            settings.javaScriptEnabled = true
            this.webViewClient = CustomWebViewClient()
            this.webChromeClient = CustomChromeClient()
        }
    }, update = {
        it.loadUrl(url)
    })
}


class CustomWebViewClient : WebViewClient()

class CustomChromeClient : WebChromeClient() {
    override fun onPermissionRequest(request: PermissionRequest?) {
        super.onPermissionRequest(request)

        //request?.grant(arrayOf(RESOURCE_VIDEO_CAPTURE));


    }

    override fun onConsoleMessage(message: ConsoleMessage): Boolean {
        // Log JavaScript console messages to Logcat
        Log.d(
            "WebViewConsole",
            "${message.message()} -- From line ${message.lineNumber()} of ${message.sourceId()}"
        )
        // Return true to indicate that the message has been handled
        return true
    }
}