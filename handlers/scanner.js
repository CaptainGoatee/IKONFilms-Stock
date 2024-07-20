import * as SDCCore from "scandit-web-datacapture-core";
import { barcodeCaptureLoader } from "scandit-web-datacapture-barcode";

const view = new SDCCore.DataCaptureView();

view.connectToElement(document.getElementById("data-capture-view"));
view.showProgressBar();
view.setProgressBarMessage("Loading ...");

await SDCCore.configure({
  licenseKey: process.env.SCANDIT_LICENSE_KEY,
  libraryLocation: new URL("library/engine/", document.baseURI).toString(),
  moduleLoaders: [barcodeCaptureLoader()],
});

view.hideProgressBar()

const context = await SDCCore.DataCaptureContext.create();
await view.setContext(context);

const settings = new SDCBarcode.BarcodeCaptureSettings();
settings.enableSymbologies([
    SDCBarcode.Symbology.Code128,
    SDCBarcode.Symbology.Code39,
    SDCBarcode.Symbology.QR,
    SDCBarcode.Symbology.EAN8,
    SDCBarcode.Symbology.UPCE,
    SDCBarcode.Symbology.EAN13UPCA
  ]);
  const listener = {
    didScan: (barcodeCapture, session) => {
      const recognizedBarcodes = session.newlyRecognizedBarcodes;
      // Do something with the barcodes
    }
  };
  const cameraSettings = SDCBarcode.BarcodeCapture.recommendedCameraSettings;

// Depending on the use case further camera settings adjustments can be made here.

const camera = SDCCore.Camera.default;

if (camera) {
  await camera.applySettings(cameraSettings);
}
await context.setFrameSource(camera);
await camera.switchToDesiredState(Scandit.FrameSourceState.On);
const view2 = await SDCCore.DataCaptureView.forContext(context);
view2.connectToElement(htmlElement);
const overlay = await SDCBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, view);
