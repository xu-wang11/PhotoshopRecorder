#target photoshop
var JPG_QUALITY = 9; //constant for saving jpeg

var folder = new Folder("~/desktop/PhotoshopRecorder");
var file_num = folder.getFiles('*').length - 1;
var select = "~/desktop/PhotoshopRecorder/" + file_num + "/tmp/select.txt";
var file = new File(select);
file.open('e');
main();

function main() {
    if (!documents.length) return;
  
    // get document name
    var docName = decodeURI(activeDocument.name);

    var path = "~/desktop/PhotoshopRecorder/" + file_num;

    // analyze document name
    var fname = docName.replace(/\.[^\.]+$/, '');
    var ext = docName.match(/[^\.]+$/);
    var historyLength = activeDocument.historyStates.length;

    // load and update current number of steps
    var stateNum = updateStateCount(path + "/tmp/stateNum.txt", historyLength)
    var cmdOutName = File(path + "/tmp/actNames.txt")
    var file = new File(cmdOutName);
    file.open("a");
var ru = app.preferences.rulerUnits;
  app.preferences.rulerUnits = Units.PIXELS;
    // start saving histories
    // if(historyLength <= 2)  return; //ignore single operation example
    //  alert(activeDocument.length);
    for (var i = 1; i < historyLength; i++) {
      activeDocument.activeHistoryState = activeDocument.historyStates[i];
      try {
        saveSelection(i);
      } catch (e) {
        alert("Something wrong when saving selection");
      }
      if(i == 1){
        var name =new File(path + "/before.jpg");
        saveJPEG(name, JPG_QUALITY);
      } else if(i == historyLength - 1){
        var name = new File(path + "/result.jpg");
        saveJPEG(name, JPG_QUALITY);
      }
      var num = zeroPad(stateNum + i - 1, 4);
      var outName = File(path + "/tmp/steps/step" + num + ".jpg");
      file.write(num + " : " + activeDocument.activeHistoryState.name + "\n");
      if (outName.exists) {
        alert(outName + "already exists");
        return;
      }
      //if (needSave(activeDocument.activeHistoryState.name) == 1) {
      //alert("save " + activeDocument.activeHistoryState.name + " as " + outName);
      saveJPEG(outName, JPG_QUALITY);
      exportLayer(i);
      //}//if
    }
    //purge the history state
    file.close();
    app.purge(PurgeTarget.HISTORYCACHES);
} //main

function updateStateCount(fname, historyLength) {
    var stateNum
    var file = new File(fname);
    file.open("e");
    var line = file.readln();
    if (line == 0) stateNum = 0;
    else stateNum = parseInt(line);

    file.seek(0, 0);
    file.write(stateNum + historyLength - 2); //fixme: snapshop could cause bug here
    file.close();
    return stateNum
}

function needSave(cmd) {
    var f;
    //skip selection
    f = cmd.search(/marquee/i);
    if (f != -1) return 0;
    f = cmd.search(/lasso/i);
    if (f != -1) return 0;
    f = cmd.search(/patch selection/i); //it's called patch "selection", but it applies patch tool...weird name
    if (f != -1) return 1;
    f = cmd.search(/(selection)|(deselect)|(select inverse)/i);
    if (f != -1) return 0;
    f = cmd.search(/(Magic Wand)|(Open)/i);
    if (f != -1) return 0;
    f = cmd.search(/(anchor point)|(path)/i);
    if (f != -1) return 0;

    return 1;
}

function saveJPEG(saveFile, jpegQuality) {
  jpgSaveOptions = new JPEGSaveOptions();
  jpgSaveOptions.embedColorProfile = true;
  jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
  jpgSaveOptions.matte = MatteType.NONE;
  jpgSaveOptions.quality = jpegQuality; //1-JPG_QUALITY
  activeDocument.saveAs(saveFile, jpgSaveOptions, true, Extension.LOWERCASE);
}


function zeroPad(val, width) {
  val = val.toString();
  while (val.length < width)
    val = '0' + val;
  return val;
};

function saveSelection(index) {
    // ensure that there is at least one document open; if not, display error message 
    if (documents.length == 0) {
        alert("There are no documents open.");
        return false;
    }

    // ensure that a selection exists; if not, display error message 


    // if both a document and a selection exist and the selection isn't empty, then proceed 
    else {
        // remember unit settings 
        var originalRulerUnits = preferences.rulerUnits;

        // main 
        try {

            // Get information about Current Selection 
            var docSource = activeDocument;
            var oCurSelection = docSource.selection;
            //var aSelSize = GetSelectionBounds(docSource); 

            // Calculate width and height in given units 
            //var b = GetSelectionBounds (docSource);
            var width = docSource.width;
            var height = docSource.height;

            var lResolution = docSource.resolution;


            var sFilePath = "~/desktop/PhotoshopRecorder/" + file_num + "/tmp/selections/" + index + ".jpg";

            var oMode = docSource.mode;

            var b = oCurSelection.bounds;
            file.write(b.toString() + "\n");
            // Copy Selection 
            oCurSelection.copy()

            // Add new document 
            var docNew = app.documents.add(width, height, lResolution, index + "", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
            app.activeDocument = docNew;
            docNew.mode = oMode;

            // Copy image to new document 
            docNew.paste()

            // Save New Document as JPEG 
            jpgFile = new File(sFilePath);
            jpgSaveOptions = new PNGSaveOptions();

            docNew.saveAs(jpgFile, jpgSaveOptions, true, Extension.LOWERCASE);

            // Close document without saving 
            docNew.close(SaveOptions.DONOTSAVECHANGES);
        }

        // display error message 
        catch (e) {
            // throw e; 
            //alert("An unknown error has occurred. Copy selection to new JPEG file failed."); 
        }
        // restore original unit setting 
        preferences.rulerUnits = originalRulerUnits;
        return true;
    }



}

function exportLayer(_index) {
    // debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
    // $.level = 0;
    // debugger; // launch debugger on next line

    // on localized builds we pull the $$$/Strings from a .dat file, see documentation for more details
    $.localize = true;

    //=================================================================
    // Globals
    //=================================================================

    // UI strings to be localized
    var strTitle = localize("$$$/JavaScripts/ExportLayersToFiles/Title=Export Layers To Files");
    var strButtonRun = localize("$$$/JavaScripts/ExportLayersToFiles/Run=Run");
    var strButtonCancel = localize("$$$/JavaScripts/ExportLayersToFiles/Cancel=Cancel");
    var strHelpText = localize("$$$/JavaScripts/ExportLayersToFiles/Help=Please specify the format and location for saving each layer as a file.");
    var strLabelDestination = localize("$$$/JavaScripts/ExportLayersToFiles/Destination=Destination:");
    var strButtonBrowse = localize("$$$/JavaScripts/ExportLayersToFiles/Browse=&Browse...");
    var strLabelFileNamePrefix = localize("$$$/JavaScripts/ExportLayersToFiles/FileNamePrefix=File Name Prefix:");
    var strCheckboxVisibleOnly = localize("$$$/JavaScripts/ExportLayersToFiles/VisibleOnly=&Visible Layers Only");
    var strCheckboxFastAndSimple = localize("$$$/JavaScripts/ExportLayersToFiles/FastAndSimple=&Fast Mode (Don't remove hidden layers)");
    var strLabelFileType = localize("$$$/JavaScripts/ExportLayersToFiles/FileType=File Type:");
    var strCheckboxIncludeICCProfile = localize("$$$/JavaScripts/ExportLayersToFiles/IncludeICC=&Include ICC Profile");
    var strJPEGOptions = localize("$$$/JavaScripts/ExportLayersToFiles/JPEGOptions=JPEG Options:");
    var strLabelQuality = localize("$$$/JavaScripts/ExportLayersToFiles/Quality=Quality:");
    var strPNGOptions = localize("$$$/JavaScripts/ExportLayersToFiles/PNGOptions=PNG Options:");
    var strCheckboxInterlaced = localize("$$$/JavaScripts/ExportLayersToFiles/Interlaced=Interlaced");
    var strPSDOptions = localize("$$$/JavaScripts/ExportLayersToFiles/PSDOptions=PSD Options:");
    var strCheckboxMaximizeCompatibility = localize("$$$/JavaScripts/ExportLayersToFiles/Maximize=&Maximize Compatibility");
    var strTIFFOptions = localize("$$$/JavaScripts/ExportLayersToFiles/TIFFOptions=TIFF Options:");
    var strLabelImageCompression = localize("$$$/JavaScripts/ExportLayersToFiles/ImageCompression=Image Compression:");
    var strNone = localize("$$$/JavaScripts/ExportLayersToFiles/None=None");
    var strPDFOptions = localize("$$$/JavaScripts/ExportLayersToFiles/PDFOptions=PDF Options:");
    var strLabelEncoding = localize("$$$/JavaScripts/ExportLayersToFiles/Encoding=Encoding:");
    var strTargaOptions = localize("$$$/JavaScripts/ExportLayersToFiles/TargaOptions=Targa Options:");
    var strLabelDepth = localize("$$$/JavaScripts/ExportLayersToFiles/Depth=Depth:");
    var strRadiobutton16bit = localize("$$$/JavaScripts/ExportLayersToFiles/Bit16=16bit");
    var strRadiobutton24bit = localize("$$$/JavaScripts/ExportLayersToFiles/Bit24=24bit");
    var strRadiobutton32bit = localize("$$$/JavaScripts/ExportLayersToFiles/Bit32=32bit");
    var strBMPOptions = localize("$$$/JavaScripts/ExportLayersToFiles/BMPOptions=BMP Options:");
    var strAlertSpecifyDestination = localize("$$$/JavaScripts/ExportLayersToFiles/SpecifyDestination=Please specify destination.");
    var strAlertDestinationNotExist = localize("$$$/JavaScripts/ExportLayersToFiles/DestionationDoesNotExist=Destination does not exist.");
    var strTitleSelectDestination = localize("$$$/JavaScripts/ExportLayersToFiles/SelectDestination=Select Destination");
    var strAlertDocumentMustBeOpened = localize("$$$/JavaScripts/ExportLayersToFiles/OneDocument=You must have a document open to export!");
    var strAlertNeedMultipleLayers = localize("$$$/JavaScripts/ExportLayersToFiles/NoLayers=You need a document with multiple layers to export!");
    var strAlertWasSuccessful = localize("$$$/JavaScripts/ExportLayersToFiles/Success= was successful.");
    var strUnexpectedError = localize("$$$/JavaScripts/ExportLayersToFiles/Unexpected=Unexpected error");
    var strMessage = localize("$$$/JavaScripts/ExportLayersToFiles/Message=Export Layers To Files action settings");
    var stretQuality = localize("$$$/locale_specific/JavaScripts/ExportLayersToFiles/ETQualityLength=30");
    var stretDestination = localize("$$$/locale_specific/JavaScripts/ExportLayersToFiles/ETDestinationLength=160");
    var strddFileType = localize("$$$/locale_specific/JavaScripts/ExportLayersToFiles/DDFileType=100");
    var strpnlOptions = localize("$$$/locale_specific/JavaScripts/ExportLayersToFiles/PNLOptions=100");

    // the drop down list indexes for file type
    var bmpIndex = 0;
    var jpegIndex = 1;
    var pdfIndex = 2;
    var pngIndex = 3;
    var psdIndex = 4;
    var targaIndex = 5;
    var tiffIndex = 6;

    // the drop down list indexes for tiff compression
    var compNoneIndex = 0;
    var compLZWIndex = 1;
    var compZIPIndex = 2;
    var compJPEGIndex = 3;

    // ok and cancel button
    var runButtonID = 1;
    var cancelButtonID = 2;

    ///////////////////////////////////////////////////////////////////////////////
    // Dispatch
    ///////////////////////////////////////////////////////////////////////////////


    main();



    ///////////////////////////////////////////////////////////////////////////////
    // Functions
    ///////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////
    // Function: main
    // Usage: the core routine for this script
    // Input: <none>
    // Return: <none>
    ///////////////////////////////////////////////////////////////////////////////

    function main() {
      if (app.documents.length <= 0) {
        if (DialogModes.NO != app.playbackDisplayDialogs) {
          // alert( strAlertDocumentMustBeOpened );
        }
        return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
      }

      var exportInfo = new Object();
      initExportInfo(exportInfo);
      try {
          var docName = app.activeDocument.name; // save the app.activeDocument name before duplicate.

          var layerCount = app.documents[docName].layers.length;
          var layerSetsCount = app.documents[docName].layerSets.length;

          if ((layerCount <= 1) && (layerSetsCount <= 0)) {
              if (DialogModes.NO != app.playbackDisplayDialogs) {
                  //  alert( strAlertNeedMultipleLayers );
                  return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
              }
          } else {

              var rememberMaximize;
              var needMaximize = exportInfo.psdMaxComp ? QueryStateType.ALWAYS : QueryStateType.NEVER;
              if (exportInfo.fileType == psdIndex && app.preferences.maximizeCompatibility != needMaximize) {
                  rememberMaximize = app.preferences.maximizeCompatibility;
                  app.preferences.maximizeCompatibility = needMaximize;
              }

              app.activeDocument = app.documents[docName];
              var duppedDocument = app.activeDocument.duplicate();
              duppedDocument.activeLayer = duppedDocument.layers[duppedDocument.layers.length - 1]; // for removing
              setInvisibleAllArtLayers(duppedDocument);
              exportChildren(duppedDocument, app.documents[docName], exportInfo, duppedDocument, exportInfo.fileNamePrefix);
              duppedDocument.close(SaveOptions.DONOTSAVECHANGES);

              var d = objectToDescriptor(exportInfo, preProcessExportInfo);
              d.putString(app.charIDToTypeID('Msge'), strMessage);
              app.putCustomOptions("4d633fbb-ed90-480d-8e03-cccb16131a34", d);

              var dd = objectToDescriptor(exportInfo, preProcessExportInfo);
              dd.putString(app.charIDToTypeID('Msge'), strMessage);
              app.playbackParameters = dd;

              if (rememberMaximize != undefined) {
                  app.preferences.maximizeCompatibility = rememberMaximize;
              }

              if (DialogModes.ALL == app.playbackDisplayDialogs) {
                  //  alert(strTitle + strAlertWasSuccessful);
              }

              app.playbackDisplayDialogs = DialogModes.ALL;

          }
      } catch (e) {
          if (DialogModes.NO != app.playbackDisplayDialogs) {
              alert(e);
          }
          return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
      }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: settingDialog
    // Usage: pop the ui and get user settings
    // Input: exportInfo object containing our parameters
    // Return: on ok, the dialog info is set to the exportInfo object
    ///////////////////////////////////////////////////////////////////////////////

    function settingDialog(exportInfo) {
        dlgMain = new Window("dialog", strTitle);

        dlgMain.orientation = 'column';
        dlgMain.alignChildren = 'left';

        // -- top of the dialog, first line
        dlgMain.add("statictext", undefined, strLabelDestination);

        // -- two groups, one for left and one for right ok, cancel
        dlgMain.grpTop = dlgMain.add("group");
        dlgMain.grpTop.orientation = 'row';
        dlgMain.grpTop.alignChildren = 'top';
        dlgMain.grpTop.alignment = 'fill';

        // -- group top left 
        dlgMain.grpTopLeft = dlgMain.grpTop.add("group");
        dlgMain.grpTopLeft.orientation = 'column';
        dlgMain.grpTopLeft.alignChildren = 'left';
        dlgMain.grpTopLeft.alignment = 'fill';

        // -- the second line in the dialog
        dlgMain.grpSecondLine = dlgMain.grpTopLeft.add("group");
        dlgMain.grpSecondLine.orientation = 'row';
        dlgMain.grpSecondLine.alignChildren = 'center';

        dlgMain.etDestination = dlgMain.grpSecondLine.add("edittext", undefined, exportInfo.destination.toString());
        dlgMain.etDestination.preferredSize.width = StrToIntWithDefault(stretDestination, 160);

        dlgMain.btnBrowse = dlgMain.grpSecondLine.add("button", undefined, strButtonBrowse);
        dlgMain.btnBrowse.onClick = function() {
            var defaultFolder = dlgMain.etDestination.text;
            var testFolder = new Folder(dlgMain.etDestination.text);
            if (!testFolder.exists) {
                defaultFolder = "~";
            }
            var selFolder = Folder.selectDialog(strTitleSelectDestination, defaultFolder);
            if (selFolder != null) {
                dlgMain.etDestination.text = selFolder.fsName;
            }
            dlgMain.defaultElement.active = true;
        }

        // -- the third line in the dialog
        dlgMain.grpTopLeft.add("statictext", undefined, strLabelFileNamePrefix);

        // -- the fourth line in the dialog
        dlgMain.etFileNamePrefix = dlgMain.grpTopLeft.add("edittext", undefined, exportInfo.fileNamePrefix.toString());
        dlgMain.etFileNamePrefix.alignment = 'fill';
        dlgMain.etFileNamePrefix.preferredSize.width = StrToIntWithDefault(stretDestination, 160);

        // -- the fifth line in the dialog
        dlgMain.cbVisible = dlgMain.grpTopLeft.add("checkbox", undefined, strCheckboxVisibleOnly);
        dlgMain.cbVisible.value = exportInfo.visibleOnly;

        // -- the sixth line is the panel
        dlgMain.cbFastAndSimple = dlgMain.grpTopLeft.add("checkbox", undefined, strCheckboxFastAndSimple);
        dlgMain.cbFastAndSimple.value = exportInfo.fastAndSimple;
        dlgMain.cbFastAndSimple.alignment = 'left';

        // -- the seventh line is the panel
        dlgMain.pnlFileType = dlgMain.grpTopLeft.add("panel", undefined, strLabelFileType);
        dlgMain.pnlFileType.alignment = 'fill';

        // -- now a dropdown list
        dlgMain.ddFileType = dlgMain.pnlFileType.add("dropdownlist");
        dlgMain.ddFileType.preferredSize.width = StrToIntWithDefault(strddFileType, 100);
        dlgMain.ddFileType.alignment = 'left';

        dlgMain.ddFileType.add("item", "BMP");
        dlgMain.ddFileType.add("item", "JPEG");
        dlgMain.ddFileType.add("item", "PDF");
        dlgMain.ddFileType.add("item", "PNG");
        dlgMain.ddFileType.add("item", "PSD");
        dlgMain.ddFileType.add("item", "Targa");
        dlgMain.ddFileType.add("item", "TIFF");

        dlgMain.ddFileType.onChange = function() {
            hideAllFileTypePanel();
            switch (this.selection.index) {
                case bmpIndex:
                    dlgMain.pnlFileType.pnlOptions.text = strBMPOptions;
                    dlgMain.pnlFileType.pnlOptions.grpBMPOptions.show();
                    break;
                case jpegIndex:
                    dlgMain.pnlFileType.pnlOptions.text = strJPEGOptions;
                    dlgMain.pnlFileType.pnlOptions.grpJPEGOptions.show();
                    break;
                case pngIndex:
                    dlgMain.pnlFileType.pnlOptions.text = strPNGOptions;
                    dlgMain.pnlFileType.pnlOptions.grpPNGOptions.show();
                    break;
                case tiffIndex:
                    dlgMain.pnlFileType.pnlOptions.text = strTIFFOptions;
                    dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.show();
                    break;
                case pdfIndex:
                    dlgMain.pnlFileType.pnlOptions.text = strPDFOptions;
                    dlgMain.pnlFileType.pnlOptions.grpPDFOptions.show();
                    break;
                case targaIndex:
                    dlgMain.pnlFileType.pnlOptions.text = strTargaOptions;
                    dlgMain.pnlFileType.pnlOptions.grpTargaOptions.show();
                    break;
                case psdIndex:
                default:
                    dlgMain.pnlFileType.pnlOptions.text = strPSDOptions;
                    dlgMain.pnlFileType.pnlOptions.grpPSDOptions.show();
                    break;
            }
        }

        dlgMain.ddFileType.items[exportInfo.fileType].selected = true;

        // -- now after all the radio buttons
        dlgMain.cbIcc = dlgMain.pnlFileType.add("checkbox", undefined, strCheckboxIncludeICCProfile);
        dlgMain.cbIcc.value = exportInfo.icc;
        dlgMain.cbIcc.alignment = 'left';

        // -- now the options panel that changes
        dlgMain.pnlFileType.pnlOptions = dlgMain.pnlFileType.add("panel", undefined, "Options");
        dlgMain.pnlFileType.pnlOptions.alignment = 'fill';
        dlgMain.pnlFileType.pnlOptions.orientation = 'stack';
        dlgMain.pnlFileType.pnlOptions.preferredSize.height = StrToIntWithDefault(strpnlOptions, 100);

        // PSD options
        dlgMain.pnlFileType.pnlOptions.grpPSDOptions = dlgMain.pnlFileType.pnlOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpPSDOptions.cbMax = dlgMain.pnlFileType.pnlOptions.grpPSDOptions.add("checkbox", undefined, strCheckboxMaximizeCompatibility);
        dlgMain.pnlFileType.pnlOptions.grpPSDOptions.cbMax.value = exportInfo.psdMaxComp;

        // JPEG options
        dlgMain.pnlFileType.pnlOptions.grpJPEGOptions = dlgMain.pnlFileType.pnlOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpJPEGOptions.add("statictext", undefined, strLabelQuality);
        dlgMain.pnlFileType.pnlOptions.grpJPEGOptions.etQuality = dlgMain.pnlFileType.pnlOptions.grpJPEGOptions.add("edittext", undefined, exportInfo.jpegQuality.toString());
        dlgMain.pnlFileType.pnlOptions.grpJPEGOptions.etQuality.preferredSize.width = StrToIntWithDefault(stretQuality, 30);

        // PNG options
        dlgMain.pnlFileType.pnlOptions.grpPNGOptions = dlgMain.pnlFileType.pnlOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpPNGOptions.cbInterlaced = dlgMain.pnlFileType.pnlOptions.grpPNGOptions.add("checkbox", undefined, strCheckboxInterlaced);
        dlgMain.pnlFileType.pnlOptions.grpPNGOptions.cbInterlaced.value = exportInfo.pngInterlaced;

        // TIFF options
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions = dlgMain.pnlFileType.pnlOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.orientation = 'column';

        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.alignment = 'left';
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.add("statictext", undefined, strLabelImageCompression);


        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.add("dropdownlist");
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.add("item", strNone);
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.add("item", "LZW");
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.add("item", "ZIP");
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.add("item", "JPEG");

        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.onChange = function() {
            if (this.selection.index == compJPEGIndex) {
                dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality.enabled = true;
                dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.enabled = true;
            } else {
                dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality.enabled = false;
                dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.enabled = false;
            }
        }

        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.alignment = 'left';
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.add("statictext", undefined, strLabelQuality);
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.add("edittext", undefined, exportInfo.tiffJpegQuality.toString());
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.preferredSize.width = StrToIntWithDefault(stretQuality, 30);

        var index;
        switch (exportInfo.tiffCompression) {
            case TIFFEncoding.NONE:
                index = compNoneIndex;
                break;
            case TIFFEncoding.TIFFLZW:
                index = compLZWIndex;
                break;
            case TIFFEncoding.TIFFZIP:
                index = compZIPIndex;
                break;
            case TIFFEncoding.JPEG:
                index = compJPEGIndex;
                break;
            default:
                index = compNoneIndex;
                break;
        }

        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.items[index].selected = true;

        if (TIFFEncoding.JPEG != exportInfo.tiffCompression) { // if not JPEG
            dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.stQuality.enabled = false;
            dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.enabled = false;
        }


        // PDF options
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions = dlgMain.pnlFileType.pnlOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.orientation = 'column';

        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.alignment = 'left';
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.add("statictext", undefined, strLabelEncoding);

        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbZip = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.add("radiobutton", undefined, "ZIP");
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbZip.onClick = function() {
            dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality.enabled = false;
            dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.enabled = false;
        }

        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbJpeg = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.add("radiobutton", undefined, "JPEG");
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbJpeg.onClick = function() {
            dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality.enabled = true;
            dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.enabled = true;
        }

        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.alignment = 'left';

        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.add("statictext", undefined, strLabelQuality);

        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.add("edittext", undefined, exportInfo.pdfJpegQuality.toString());
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.preferredSize.width = StrToIntWithDefault(stretQuality, 30);

        switch (exportInfo.pdfEncoding) {
            case PDFEncoding.PDFZIP:
                dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbZip.value = true;
                break;
            case PDFEncoding.JPEG:
            default:
                dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbJpeg.value = true;
                break;
        }

        if (PDFEncoding.JPEG != exportInfo.pdfEncoding) {
            dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.stQuality.enabled = false;
            dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.enabled = false;
        }

        // Targa options
        dlgMain.pnlFileType.pnlOptions.grpTargaOptions = dlgMain.pnlFileType.pnlOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add("statictext", undefined, strLabelDepth);

        dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb16bit = dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add("radiobutton", undefined, strRadiobutton16bit);
        dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb24bit = dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add("radiobutton", undefined, strRadiobutton24bit);
        dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb32bit = dlgMain.pnlFileType.pnlOptions.grpTargaOptions.add("radiobutton", undefined, strRadiobutton32bit);

        switch (exportInfo.targaDepth) {
            case TargaBitsPerPixels.SIXTEEN:
                dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb16bit.value = true;
                break;
            case TargaBitsPerPixels.TWENTYFOUR:
                dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb24bit.value = true;
                break;
            case TargaBitsPerPixels.THIRTYTWO:
                dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb32bit.value = true;
                break;
            default:
                dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb24bit.value = true;
                break;
        }


        // BMP options
        dlgMain.pnlFileType.pnlOptions.grpBMPOptions = dlgMain.pnlFileType.pnlOptions.add("group");
        dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add("statictext", undefined, strLabelDepth);

        dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb16bit = dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add("radiobutton", undefined, strRadiobutton16bit);
        dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb24bit = dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add("radiobutton", undefined, strRadiobutton24bit);
        dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb32bit = dlgMain.pnlFileType.pnlOptions.grpBMPOptions.add("radiobutton", undefined, strRadiobutton32bit);

        switch (exportInfo.bmpDepth) {
            case BMPDepthType.SIXTEEN:
                dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb16bit.value = true;
                break;
            case BMPDepthType.TWENTYFOUR:
                dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb24bit.value = true;
                break;
            case BMPDepthType.THIRTYTWO:
                dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb32bit.value = true;
                break;
            default:
                dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb24bit.value = true;
                break;
        }

        // the right side of the dialog, the ok and cancel buttons
        dlgMain.grpTopRight = dlgMain.grpTop.add("group");
        dlgMain.grpTopRight.orientation = 'column';
        dlgMain.grpTopRight.alignChildren = 'fill';

        dlgMain.btnRun = dlgMain.grpTopRight.add("button", undefined, strButtonRun);

        dlgMain.btnRun.onClick = function() {
            // check if the setting is properly
            var destination = dlgMain.etDestination.text;
            if (destination.length == 0) {
                //  alert(strAlertSpecifyDestination);
                return;
            }
            var testFolder = new Folder(destination);
            if (!testFolder.exists) {
                // alert(strAlertDestinationNotExist);
                return;
            }

            dlgMain.close(runButtonID);
        }

        dlgMain.btnCancel = dlgMain.grpTopRight.add("button", undefined, strButtonCancel);

        dlgMain.btnCancel.onClick = function() {
            dlgMain.close(cancelButtonID);
        }

        dlgMain.defaultElement = dlgMain.btnRun;
        dlgMain.cancelElement = dlgMain.btnCancel;

        // the bottom of the dialog
        dlgMain.grpBottom = dlgMain.add("group");
        dlgMain.grpBottom.orientation = 'column';
        dlgMain.grpBottom.alignChildren = 'left';
        dlgMain.grpBottom.alignment = 'fill';

        dlgMain.pnlHelp = dlgMain.grpBottom.add("panel");
        dlgMain.pnlHelp.alignment = 'fill';

        dlgMain.etHelp = dlgMain.pnlHelp.add("statictext", undefined, strHelpText, {
            multiline: true
        });
        dlgMain.etHelp.alignment = 'fill';

        dlgMain.onShow = function() {
            dlgMain.ddFileType.onChange();
        }

        // give the hosting app the focus before showing the dialog
        app.bringToFront();

        dlgMain.center();

        var result = dlgMain.show();

        if (cancelButtonID == result) {
            return result; // close to quit
        }

        // get setting from dialog
        exportInfo.destination = dlgMain.etDestination.text;
        exportInfo.fileNamePrefix = dlgMain.etFileNamePrefix.text;
        exportInfo.visibleOnly = dlgMain.cbVisible.value;
        exportInfo.fastAndSimple = dlgMain.cbFastAndSimple.value;
        exportInfo.fileType = dlgMain.ddFileType.selection.index;
        exportInfo.icc = dlgMain.cbIcc.value;
        exportInfo.jpegQuality = dlgMain.pnlFileType.pnlOptions.grpJPEGOptions.etQuality.text;
        exportInfo.pngInterlaced = dlgMain.pnlFileType.pnlOptions.grpPNGOptions.cbInterlaced.value;
        exportInfo.psdMaxComp = dlgMain.pnlFileType.pnlOptions.grpPSDOptions.cbMax.value;
        index = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpCompression.ddCompression.selection.index;
        if (index == compNoneIndex) {
            exportInfo.tiffCompression = TIFFEncoding.NONE;
        }
        if (index == compLZWIndex) {
            exportInfo.tiffCompression = TIFFEncoding.TIFFLZW;
        }
        if (index == compZIPIndex) {
            exportInfo.tiffCompression = TIFFEncoding.TIFFZIP;
        }
        if (index == compJPEGIndex) {
            exportInfo.tiffCompression = TIFFEncoding.JPEG;
        }
        exportInfo.tiffJpegQuality = dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etQuality.text;
        if (dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbZip.value) {
            exportInfo.pdfEncoding = PDFEncoding.PDFZIP;
        }
        if (dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpCompression.rbJpeg.value) {
            exportInfo.pdfEncoding = PDFEncoding.JPEG;
        }
        exportInfo.pdfJpegQuality = dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etQuality.text;
        if (dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb16bit.value) {
            exportInfo.targaDepth = TargaBitsPerPixels.SIXTEEN;
        }
        if (dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb24bit.value) {
            exportInfo.targaDepth = TargaBitsPerPixels.TWENTYFOUR;
        }
        if (dlgMain.pnlFileType.pnlOptions.grpTargaOptions.rb32bit.value) {
            exportInfo.targaDepth = TargaBitsPerPixels.THIRTYTWO;
        }
        if (dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb16bit.value) {
            exportInfo.bmpDepth = BMPDepthType.SIXTEEN;
        }
        if (dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb24bit.value) {
            exportInfo.bmpDepth = BMPDepthType.TWENTYFOUR;
        }
        if (dlgMain.pnlFileType.pnlOptions.grpBMPOptions.rb32bit.value) {
            exportInfo.bmpDepth = BMPDepthType.THIRTYTWO;
        }

        return result;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: hideAllFileTypePanel
    // Usage: hide all the panels in the common actions
    // Input: <none>, dlgMain is a global for this script
    // Return: <none>, all panels are now hidden
    ///////////////////////////////////////////////////////////////////////////////

    function hideAllFileTypePanel() {
        dlgMain.pnlFileType.pnlOptions.grpPSDOptions.hide();
        dlgMain.pnlFileType.pnlOptions.grpJPEGOptions.hide();
        dlgMain.pnlFileType.pnlOptions.grpPNGOptions.hide();
        dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.hide();
        dlgMain.pnlFileType.pnlOptions.grpPDFOptions.hide();
        dlgMain.pnlFileType.pnlOptions.grpTargaOptions.hide();
        dlgMain.pnlFileType.pnlOptions.grpBMPOptions.hide();
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: initExportInfo
    // Usage: create our default parameters
    // Input: a new Object
    // Return: a new object with params set to default
    ///////////////////////////////////////////////////////////////////////////////

    function initExportInfo(exportInfo) {
        exportInfo.destination = new String("");
        exportInfo.fileNamePrefix = new String("untitled_");
        exportInfo.visibleOnly = false;
        exportInfo.fastAndSimple = false;
        exportInfo.fileType = jpegIndex;
        exportInfo.icc = true;
        exportInfo.jpegQuality = 8;
        exportInfo.pngInterlaced = false;
        exportInfo.psdMaxComp = true;
        exportInfo.tiffCompression = TIFFEncoding.NONE;
        exportInfo.tiffJpegQuality = 8;
        exportInfo.pdfEncoding = PDFEncoding.JPEG;
        exportInfo.pdfJpegQuality = 8;
        exportInfo.targaDepth = TargaBitsPerPixels.TWENTYFOUR;
        exportInfo.bmpDepth = BMPDepthType.TWENTYFOUR;

        try {
            exportInfo.destination = Folder(app.activeDocument.fullName.parent).fsName; // destination folder
            var tmp = app.activeDocument.fullName.name;
            exportInfo.fileNamePrefix = decodeURI(tmp.substring(0, tmp.indexOf(".")) + 'index'); // filename body part
        } catch (someError) {
            exportInfo.destination = new String("");
            exportInfo.fileNamePrefix = app.activeDocument.name; // filename body part
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: saveFile
    // Usage: the worker routine, take our params and save the file accordingly
    // Input: reference to the document, the name of the output file, 
    //        export info object containing more information
    // Return: <none>, a file on disk
    ///////////////////////////////////////////////////////////////////////////////

    function saveFile(docRef, fileNameBody, exportInfo) {
        fileNameBody = "~/desktop/PhotoshopRecorder/" + file_num + "/tmp/layers/" + _index + "_" + fileNameBody;
        switch (exportInfo.fileType) {
            case jpegIndex:
                docRef.bitsPerChannel = BitsPerChannelType.EIGHT;
                var saveFile = new File(fileNameBody + ".jpg");
                jpgSaveOptions = new JPEGSaveOptions();
                jpgSaveOptions.embedColorProfile = exportInfo.icc;
                jpgSaveOptions.quality = exportInfo.jpegQuality;
                docRef.saveAs(saveFile, jpgSaveOptions, true, Extension.LOWERCASE);
                break;
            case pngIndex:
                var saveFile = new File(fileNameBody + ".png");
                pngSaveOptions = new PNGSaveOptions();
                pngSaveOptions.interlaced = exportInfo.pngInterlaced;
                docRef.saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE);
                break;
            case psdIndex:
                var saveFile = new File(fileNameBody + ".psd");
                psdSaveOptions = new PhotoshopSaveOptions();
                psdSaveOptions.embedColorProfile = exportInfo.icc;
                psdSaveOptions.maximizeCompatibility = exportInfo.psdMaxComp;
                docRef.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);
                break;
            case tiffIndex:
                var saveFile = new File(fileNameBody + ".tif");
                tiffSaveOptions = new TiffSaveOptions();
                tiffSaveOptions.embedColorProfile = exportInfo.icc;
                tiffSaveOptions.imageCompression = exportInfo.tiffCompression;
                if (TIFFEncoding.JPEG == exportInfo.tiffCompression) {
                    tiffSaveOptions.jpegQuality = exportInfo.tiffJpegQuality;
                }
                docRef.saveAs(saveFile, tiffSaveOptions, true, Extension.LOWERCASE);
                break;
            case pdfIndex:
                if (docRef.bitsPerChannel == BitsPerChannelType.THIRTYTWO)
                    docRef.bitsPerChannel = BitsPerChannelType.SIXTEEN;
                var saveFile = new File(fileNameBody + ".pdf");
                pdfSaveOptions = new PDFSaveOptions();
                pdfSaveOptions.embedColorProfile = exportInfo.icc;
                pdfSaveOptions.encoding = exportInfo.pdfEncoding;
                if (PDFEncoding.JPEG == exportInfo.pdfEncoding) {
                    pdfSaveOptions.jpegQuality = exportInfo.pdfJpegQuality;
                }
                docRef.saveAs(saveFile, pdfSaveOptions, true, Extension.LOWERCASE);
                break;
            case targaIndex:
                docRef.bitsPerChannel = BitsPerChannelType.EIGHT;
                var saveFile = new File(fileNameBody + ".tga");
                targaSaveOptions = new TargaSaveOptions();
                targaSaveOptions.resolution = exportInfo.targaDepth;
                docRef.saveAs(saveFile, targaSaveOptions, true, Extension.LOWERCASE);
                break;
            case bmpIndex:
                docRef.bitsPerChannel = BitsPerChannelType.EIGHT;
                var saveFile = new File(fileNameBody + ".bmp");
                bmpSaveOptions = new BMPSaveOptions();
                bmpSaveOptions.depth = exportInfo.bmpDepth;
                docRef.saveAs(saveFile, bmpSaveOptions, true, Extension.LOWERCASE);
                break;
            default:
                if (DialogModes.NO != app.playbackDisplayDialogs) {

                    //alert(strUnexpectedError);
                }
                break;
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: zeroSuppress
    // Usage: return a string padded to digit(s)
    // Input: num to convert, digit count needed
    // Return: string padded to digit length
    ///////////////////////////////////////////////////////////////////////////////

    function zeroSuppress(num, digit) {
        var tmp = num.toString();
        while (tmp.length < digit) {
            tmp = "0" + tmp;
            return tmp;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////
    // Function: setInvisibleAllArtLayers
    // Usage: unlock and make invisible all art layers, recursively
    // Input: document or layerset
    // Return: all art layers are unlocked and invisible
    ///////////////////////////////////////////////////////////////////////////////

    function setInvisibleAllArtLayers(obj) {
        for (var i = 0; i < obj.artLayers.length; i++) {
            obj.artLayers[i].allLocked = false;
            obj.artLayers[i].visible = false;
        }
        for (var i = 0; i < obj.layerSets.length; i++) {
            setInvisibleAllArtLayers(obj.layerSets[i]);
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: removeAllInvisibleArtLayers
    // Usage: remove all the invisible art layers, recursively
    // Input: document or layer set
    // Return: <none>, all layers that were invisible are now gone
    ///////////////////////////////////////////////////////////////////////////////

    function removeAllInvisibleArtLayers(obj) {
        for (var i = obj.artLayers.length - 1; 0 <= i; i--) {
            try {
                if (!obj.artLayers[i].visible) {
                    obj.artLayers[i].remove();
                }
            } catch (e) {}
        }
        for (var i = obj.layerSets.length - 1; 0 <= i; i--) {
            removeAllInvisibleArtLayers(obj.layerSets[i]);
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: removeAllEmptyLayerSets
    // Usage: find all empty layer sets and remove them, recursively
    // Input: document or layer set
    // Return: empty layer sets are now gone
    ///////////////////////////////////////////////////////////////////////////////

    function removeAllEmptyLayerSets(obj) {
        var foundEmpty = true;
        for (var i = obj.layerSets.length - 1; 0 <= i; i--) {
            if (removeAllEmptyLayerSets(obj.layerSets[i])) {
                obj.layerSets[i].remove();
            } else {
                foundEmpty = false;
            }
        }
        if (obj.artLayers.length > 0) {
            foundEmpty = false;
        }
        return foundEmpty;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: zeroSuppress
    // Usage: return a string padded to digit(s)
    // Input: num to convert, digit count needed
    // Return: string padded to digit length
    ///////////////////////////////////////////////////////////////////////////////

    function removeAllInvisible(docRef) {
        removeAllInvisibleArtLayers(docRef);
        removeAllEmptyLayerSets(docRef);
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: exportChildren
    // Usage: find all the children in this document to save
    // Input: duplicate document, original document, export info,
    //        reference to document, starting file name
    // Return: <none>, documents are saved accordingly
    ///////////////////////////////////////////////////////////////////////////////

    function exportChildren(dupObj, orgObj, exportInfo, dupDocRef, fileNamePrefix) {
        for (var i = 0; i < dupObj.artLayers.length; i++) {
            if (exportInfo.visibleOnly) { // visible layer only
                if (!orgObj.artLayers[i].visible) {
                    continue;
                }
            }
            dupObj.artLayers[i].visible = true;

            var layerName = dupObj.artLayers[i].name; // store layer name before change doc

            if (!exportInfo.fastAndSimple) {
                var duppedDocumentTmp = dupDocRef.duplicate();
                if (psdIndex == exportInfo.fileType) { // PSD: Keep transparency
                    removeAllInvisible(duppedDocumentTmp);
                } else { // just flatten
                    duppedDocumentTmp.flatten();
                }
            }

            var fileNameBody = zeroSuppress(i, 4);
            fileNameBody += "_" + layerName;
            fileNameBody = fileNameBody.replace(/[:\/\\*\?\"\<\>\|]/g, "_"); // '/\:*?"<>|' -> '_'
            if (fileNameBody.length > 120) {
                fileNameBody = fileNameBody.substring(0, 120);
            }
            if (exportInfo.fastAndSimple) {
                saveFile(dupObj, fileNameBody, exportInfo);
            } else {
                saveFile(duppedDocumentTmp, fileNameBody, exportInfo);
                duppedDocumentTmp.close(SaveOptions.DONOTSAVECHANGES);
            }

            dupObj.artLayers[i].visible = false;
        }
        for (var i = 0; i < dupObj.layerSets.length; i++) {
            if (exportInfo.visibleOnly) { // visible layer only
                if (!orgObj.layerSets[i].visible) {
                    continue;
                }
            }
            var fileNameBody = fileNamePrefix;
            fileNameBody += "_" + zeroSuppress(i, 4) + "s";
            exportChildren(dupObj.layerSets[i], orgObj.layerSets[i], exportInfo, dupDocRef, fileNameBody); // recursive call
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: objectToDescriptor
    // Usage: create an ActionDescriptor from a JavaScript Object
    // Input: JavaScript Object (o)
    //        Pre process converter (f)
    // Return: ActionDescriptor
    // NOTE: Only boolean, string, and number are supported, use a pre processor
    //       to convert (f) other types to one of these forms.
    ///////////////////////////////////////////////////////////////////////////////

    function objectToDescriptor(o, f) {
        if (undefined != f) {
            o = f(o);
        }
        var d = new ActionDescriptor;
        var l = o.reflect.properties.length;
        for (var i = 0; i < l; i++) {
            var k = o.reflect.properties[i].toString();
            if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect")
                continue;
            var v = o[k];
            k = app.stringIDToTypeID(k);
            switch (typeof(v)) {
                case "boolean":
                    d.putBoolean(k, v);
                    break;
                case "string":
                    d.putString(k, v);
                    break;
                case "number":
                    d.putDouble(k, v);
                    break;
                default:
                    throw (new Error("Unsupported type in objectToDescriptor " + typeof(v) + " (" + o.reflect.properties[i].toString() + ")"));
            }
        }
        return d;
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: descriptorToObject
    // Usage: update a JavaScript Object from an ActionDescriptor
    // Input: JavaScript Object (o), current object to update (output)
    //        Photoshop ActionDescriptor (d), descriptor to pull new params for object from
    //        JavaScript Function (f), post process converter utility to convert
    // Return: Nothing, update is applied to passed in JavaScript Object (o)
    // NOTE: Only boolean, string, and number are supported, use a post processor
    //       to convert (f) other types to one of these forms.
    ///////////////////////////////////////////////////////////////////////////////

    function descriptorToObject(o, d, f) {
        var l = d.count;
        for (var i = 0; i < l; i++) {
            var k = d.getKey(i); // i + 1 ?
            var t = d.getType(k);
            strk = app.typeIDToStringID(k);
            switch (t) {
                case DescValueType.BOOLEANTYPE:
                    o[strk] = d.getBoolean(k);
                    break;
                case DescValueType.STRINGTYPE:
                    o[strk] = d.getString(k);
                    break;
                case DescValueType.DOUBLETYPE:
                    o[strk] = d.getDouble(k);
                    break;
                case DescValueType.INTEGERTYPE:
                case DescValueType.ALIASTYPE:
                case DescValueType.CLASSTYPE:
                case DescValueType.ENUMERATEDTYPE:
                case DescValueType.LISTTYPE:
                case DescValueType.OBJECTTYPE:
                case DescValueType.RAWTYPE:
                case DescValueType.REFERENCETYPE:
                case DescValueType.UNITDOUBLE:
                default:
                    throw (new Error("Unsupported type in descriptorToObject " + t));
            }
        }
        if (undefined != f) {
            o = f(o);
        }
    }


    ///////////////////////////////////////////////////////////////////////////////
    // Function: preProcessExportInfo
    // Usage: convert Photoshop enums to strings for storage
    // Input: JavaScript Object of my params for this script
    // Return: JavaScript Object with objects converted for storage
    ///////////////////////////////////////////////////////////////////////////////

    function preProcessExportInfo(o) {
        o.tiffCompression = o.tiffCompression.toString();
        o.pdfEncoding = o.pdfEncoding.toString();
        o.targaDepth = o.targaDepth.toString();
        o.bmpDepth = o.bmpDepth.toString();
        return o;
    }

    ///////////////////////////////////////////////////////////////////////////////
    // Function: postProcessExportInfo
    // Usage: convert strings from storage to Photoshop enums
    // Input: JavaScript Object of my params in string form
    // Return: JavaScript Object with objects in enum form
    ///////////////////////////////////////////////////////////////////////////////

    function postProcessExportInfo(o) {
        o.tiffCompression = eval(o.tiffCompression);
        o.pdfEncoding = eval(o.pdfEncoding);
        o.targaDepth = eval(o.targaDepth);
        o.bmpDepth = eval(o.bmpDepth);
        return o;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Function: StrToIntWithDefault
    // Usage: convert a string to a number, first stripping all characters
    // Input: string and a default number
    // Return: a number
    ///////////////////////////////////////////////////////////////////////////

    function StrToIntWithDefault(s, n) {
        var onlyNumbers = /[^0-9]/g;
        var t = s.replace(onlyNumbers, "");
        t = parseInt(t);
        if (!isNaN(t)) {
            n = t;
        }
        return n;
    }
    // End Export Layers To Files.jsx

}