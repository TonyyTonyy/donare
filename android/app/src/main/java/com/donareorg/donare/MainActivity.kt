package com.donareorg.donare

import android.app.AlertDialog
import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.addCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.donareorg.donare.ui.theme.DonareTheme
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {
    private var webView: WebView? = null
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraPhotoUri: Uri? = null
    
    private lateinit var cameraCaptureActivityLauncher: ActivityResultLauncher<Intent>
    private lateinit var galleryPickerActivityLauncher: ActivityResultLauncher<Intent>
    private lateinit var requestCameraPermissionLauncher: ActivityResultLauncher<String>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(true)

        enableEdgeToEdge()

        // Permission request launcher
        requestCameraPermissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { granted ->
            if (granted) {
                launchCameraPicker()
            } else {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = null
            }
        }

        // Camera capture launcher
        cameraCaptureActivityLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            val callback = filePathCallback ?: return@registerForActivityResult

            if (result.resultCode == RESULT_OK && cameraPhotoUri != null) {
                callback.onReceiveValue(arrayOf(cameraPhotoUri!!))
            } else {
                callback.onReceiveValue(null)
            }
            filePathCallback = null
            cameraPhotoUri = null
        }

        // Gallery picker launcher
        galleryPickerActivityLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            val callback = filePathCallback ?: return@registerForActivityResult

            if (result.resultCode == RESULT_OK && result.data?.data != null) {
                callback.onReceiveValue(arrayOf(result.data!!.data!!))
            } else {
                callback.onReceiveValue(null)
            }
            filePathCallback = null
            cameraPhotoUri = null
        }

        // Back button handling
        onBackPressedDispatcher.addCallback(this) {
            if (webView?.canGoBack() == true) {
                webView?.goBack()
            } else {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
            }
        }

        setContent {
            DonareTheme {
                Scaffold { innerPadding ->
                    Surface(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        WebViewScreen(
                            url = "https://donare-gamma.vercel.app/",
                            modifier = Modifier.fillMaxSize(),
                            onWebViewCreated = {
                                webView = it
                                it.webChromeClient = CustomChromeClient()
                            }
                        )
                    }
                }
            }
        }
    }

    private fun showImageSourceDialog() {
        AlertDialog.Builder(this)
            .setTitle("Select Image Source")
            .setItems(arrayOf("Camera", "Gallery")) { _, which ->
                when (which) {
                    0 -> {
                        if (ContextCompat.checkSelfPermission(
                                this,
                                Manifest.permission.CAMERA
                            ) == PackageManager.PERMISSION_GRANTED
                        ) {
                            launchCameraPicker()
                        } else {
                            requestCameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    }
                    1 -> launchGalleryPicker()
                }
            }
            .setOnCancelListener {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = null
            }
            .show()
    }

    private fun launchCameraPicker() {
        val photoFile = try {
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            File.createTempFile("JPEG_$timeStamp", ".jpg", getExternalFilesDir(Environment.DIRECTORY_PICTURES))
        } catch (ex: IOException) {
            Log.e("MainActivity", "Failed to create image file", ex)
            filePathCallback?.onReceiveValue(null)
            filePathCallback = null
            return
        }

        cameraPhotoUri = FileProvider.getUriForFile(this, "$packageName.fileprovider", photoFile)

        Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            putExtra(MediaStore.EXTRA_OUTPUT, cameraPhotoUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            cameraCaptureActivityLauncher.launch(this)
        }
    }

    private fun launchGalleryPicker() {
        Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
            type = "image/*"
            galleryPickerActivityLauncher.launch(this)
        }
    }

    inner class CustomChromeClient : WebChromeClient() {
        override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?
        ): Boolean {
            this@MainActivity.filePathCallback?.onReceiveValue(null)
            this@MainActivity.filePathCallback = filePathCallback
            showImageSourceDialog()
            return true
        }

        override fun onPermissionRequest(request: PermissionRequest?) {
            request?.grant(request.resources)
        }

        override fun onConsoleMessage(message: ConsoleMessage): Boolean {
            Log.d("WebViewConsole", "${message.message()} -- Line ${message.lineNumber()} of ${message.sourceId()}")
            return true
        }
    }
}

@Composable
fun WebViewScreen(
    url: String,
    modifier: Modifier = Modifier,
    onWebViewCreated: (WebView) -> Unit = {}
) {
    AndroidView(
        modifier = modifier,
        factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                }
                webViewClient = CustomWebViewClient()
                onWebViewCreated(this)
            }
        },
        update = { it.loadUrl(url) }
    )
}

class CustomWebViewClient : WebViewClient()