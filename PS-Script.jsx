var folder = new Folder("~/desktop/PhotoshopRecorder");
var files = folder.getFiles('*');
var file_num = files.length;
var folder1 = Folder("~/desktop/PhotoshopRecorder");
if (!folder1.exists) folder1.create();
folder1 = Folder('~/desktop/PhotoshopRecorder/' + file_num);
if(!folder1.exists) folder1.create();
folder1 = Folder('~/desktop/PhotoshopRecorder/' + file_num + '/tmp');
if(!folder1.exists) folder1.create();
var folder2 = Folder("~/desktop/PhotoshopRecorder/"+ file_num +"/tmp/steps");
if (!folder2.exists) folder2.create();
var folder3 = Folder("~/desktop/PhotoshopRecorder/"+ file_num + "/tmp/selections");
if (!folder3.exists) folder3.create();
folder3 = Folder("~/desktop/PhotoshopRecorder/"+ file_num + "/tmp/layers");
if (!folder3.exists) folder3.create();
var geo_dynamic = File('~/desktop/PS-Script/ActionFileFromSLCode.jsx');
$.evalFile (geo_dynamic);
geo_dynamic = File('~/desktop/PS-Script/ActionFileToXML.jsx');
$.evalFile (geo_dynamic);
geo_dynamic = File('~/desktop/PS-Script/SaveHistory.jsx');
$.evalFile (geo_dynamic);
geo_dynamic = File('~/desktop/PS-Script/UpdateXML.jsx');
$.evalFile (geo_dynamic);
var file = new File('~/desktop/ScriptingListenerJS.log');
alert(file.remove());
file = new File('~/desktop/ScriptingListenerVB.log');
file.remove();



