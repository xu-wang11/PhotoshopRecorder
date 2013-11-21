//获得最后生成的文件夹路径
var folder = new Folder("~/desktop/PhotoshopRecorder");
var file_num = folder.getFiles('*').length - 1;
var file = new File('~/desktop/PhotoshopRecorder/' + file_num + '/tmp/ActionXML.xml');
var _path = '~/desktop/PhotoshopRecorder/' + file_num;
//在这里定义一些常量，用来对应actNames表和xml中的属性-->
//toolsaction 表示actName和xml的对应关系可以通过Action.@name来对应-->
//可以从ActionItem中判断出来是哪个工具的对应关系

var LookFromActionItem = {
	'Fill': 'Fill',
	'Gradient': 'Gradient',
	'Clear': 'Delete',
	'Clouds': 'Clouds',
	'Blur Gallery': 'blurbTransform',
	'Average': 'Average',
	'Blur': 'Blur',
	'Blur More': 'BlurMore',
	'Box Blur': 'boxblur',
	'Gaussian Blur': 'GaussianBlur',
	'Lens Blur': 'Bokh',
	'Motion Blur': 'MotionBlur',
	'Radial Blur': 'RadialBlur',
	'Shape Blur': 'shapeBlur',
	'Smart Blur': 'SmartBlur',
	'Surface Blur': 'surfaceBlur',
	'Pinch': 'Pinch',
	'Polar Coordinates': 'Polar',
	'Ripple': 'Ripple',
	'Shear': 'Shear',
	'Spherize': 'Spherize',
	'Twirl': 'Twirl',
	'Wave': 'Wave',
	'ZigZag': 'ZigZag',
	'Add Noise': 'AddNoise',
	'Despeckle': 'Despeckle',
	'Dust & Scratches': 'DustAndScratches',
	'Median': 'Median',
	'Reduce Noise': 'denoise',
	'Color Halftone': 'ColorHalftone',
	'Crystallize': 'Crystallize',
	'Facet': 'Facet',
	'Fragment': 'Fragment',
	'Mezzotint': 'Mezzotint',
	'Mosaic': 'Mosaic',
	'Pointillize': 'Pointillize',
	'Difference Clouds': 'DifferenceClouds',
	'Fibers': 'Fibers',
	'Lens Flare': 'LensFlare',
	'Sharpen': 'Sharpen',
	'Sharpen Edges': 'SharpenEdges',
	'Sharpen More': 'SharpenMore',
	'Smart Sharpen': 'smartSharpen',
	'Unsharp Mask': 'UnsharpMask',
	'Diffuse': 'Diffuse',
	'Emboss': 'Emboss',
	'Find Edges': 'FindEdges',
	'Solarize': 'Solarize',
	'Tiles': 'Tiles',
	'Trace Contour': 'TraceContour',
	'Wind': 'Wind',
	'Extrude': 'Extrude',
	'Move':'Cut',
};

var NotNeedCare = new Array('Open', 'Deselect', 'New Layer');
//在工具栏选择工具
var SelectAction = {

};
var SetAction = new Array('Rectangular Marquee', 'Lasso', 'Magnetic Lasso');


//需要手动插入节点的action
var ToInsertNodeAction = {
	'Quick Selection': 'quickSelectTool',
};

var NodeStack = new Array();

//这里进行预处理
if (file.exists) {
	//删除xml中的key和id属性
	file.open('r');
	var content = file.read();
	file.close();
	var xml = new XML(content);
	//javascript function

	function deleteKeyOrID(root) {
		delete root.@key;
		delete root.@id;
		var childs = root.children().length();

		for (var item = 0; item < childs; item++)
			deleteKeyOrID(root.child(item));
	}

	deleteKeyOrID(xml);
	//获取selection文件夹中的所有文件
	var selection = new Folder(_path + '/tmp/selections');
	var selection_files = selection.getFiles('*');
	var selection_files_length = selection_files.length;
	//alert(selections_files.toString());
	//获取layer选区的所有文件
	var layer = new Folder(_path + '/tmp/layers');
	var layer_files = layer.getFiles('*');
	var layer_files_length = layer_files.length;
	//alert(layer_files.toString());
	//提取actNames中的所有action命令
	var action_file = new File(_path + '/tmp/actNames.txt');
	var actions = new Array();
	if (action_file.exists) {
		action_file.open('r');

		while (!action_file.eof) {
			var str = action_file.readln();
			var temp = str.split(':');
			//temp第一个元素为标号，第二个元素为actionname，但是第一个字符为空格，所以要去掉
			actions.push(temp[1].substr(1));
		}

		action_file.close();

	} else {
		alert(_path);
		alert('no file found~');
	}
	//提取出select.txt中的选区对应的包围矩形
	var select_area_file = new File(_path + '/tmp/select.txt');
	var select_area = new Array();
	if (select_area_file.exists) {
		select_area_file.open('r');
		while (!select_area_file.eof) {
			var str = select_area_file.readln();
			select_area.push(str);
		}
	} else {
		alert('select.txt is not exists');
	}
	//将提取出来的layer按文件名进行分类
	//文件名记录文件对应的actionName，同时也对应了layer的名字中间用‘——’分割
	var classify_layer = {};
	for (var i = 0; i < layer_files_length; i++) {
		var temp_file = layer_files[i];
		var temp_file_name = temp_file.displayName.split('.')[0];
		//alert(temp_file_name);
		var temp_file_num = temp_file_name.split('_')[0];
		//alert(temp_file_num);
		if (classify_layer[temp_file_num] === undefined) {
			classify_layer[temp_file_num] = new Array();
		}
		classify_layer[temp_file_num].push(temp_file);
	}
	//对select文件夹内的图片进行排序
	//在javascript中的字面量的顺序不是按照数字来排序的。所以保存为字面量的selection_files对象要进行一次排序操作
	//排序很简单，将其文件名作为数组下标重新保存一遍
	var elements = new Array();
	var sortArray = {};
	var maxKey = 0; //记录最大的文件名数字
	for (var i = 0; i < selection_files_length; i++) {
		var temp_file = selection_files[i];
		var num = parseInt(temp_file.displayName.split('.')[0]);
		if (num > maxKey)
			maxKey = num;
		sortArray[num] = temp_file;
	}
	var curIndex = 0;
	//对上面处理的所有数据进行收集
	for (var key = 0; key <= maxKey; key++) {
		if (sortArray[key] == undefined)
			continue;
		var temp_file = sortArray[key];
		var temp_file_num = temp_file.displayName.split('.')[0];

		elements.push({
			'num': temp_file_num,
			'select': temp_file,
			'layer': classify_layer[temp_file_num],
			'area': select_area[curIndex],
			'action': actions[key - 1]
		});
		curIndex++;
	}

	///进行匹配
	var ActionItem = xml.ActionSet.Action;
	var ItemCount = ActionItem.children().length();
	var matchIndex = 0;
	curIndex = 0;
	var total_count = elements.length;
	for (var item = 0; item < total_count; item ++) {
		var i = curIndex;
		curIndex++;
		var action = elements[item]['action'];
		if (isInArray(NotNeedCare, action) === true) {
			//不应该在js中对应这个函数内部
			alert('选区对应了本不应该考虑的地方，需要验证你的代码的正确性');
			continue;
		} else if (isInArray(SetAction, action) === true) {
			for (var j = matchIndex; j < ItemCount; j++) {
				if ((ActionItem.ActionItem[j].@name.toString() === 'Set' || ActionItem.ActionItem[j].@name.toString() === 'AddTo') && ActionItem.ActionItem[j].ActionDescriptor.children()[0].children()[0].children()[0].@propertyName.toString() === 'selection' &&
					ActionItem.ActionItem[j].ActionDescriptor.children()[1].@enumeratedValueString.toString() !== 'None') {
					moveFiles(i, elements[item], ActionItem.ActionItem[j], action);
					matchIndex = j + 1;
					if (NodeStack.length > 1) {
						alert('请检查你的代码，在你的node堆栈和你的预想不同');
					} else if (NodeStack.length == 1) {
						ActionItem.insertChildBefore(ActionItem.ActionItem[j], NodeStack.pop());
						matchIndex++;
					}
					break;


				}
			}
		} else if (LookFromActionItem[action] !== undefined) {
			for (var j = matchIndex; j < ItemCount; j++) {
				if (ActionItem.ActionItem[j].@name.toString() === LookFromActionItem[action]) {
					moveFiles(i, elements[item], ActionItem.ActionItem[j], LookFromActionItem[action]);
					matchIndex = j + 1;
					if (NodeStack.length > 1) {
						alert('请检查你的代码，在你的node堆栈和你的预想不同');
					} else if (NodeStack.length == 1) {
						ActionItem.insertChildBefore(ActionItem.ActionItem[j], NodeStack.pop());
                            ItemCount ++;
						matchIndex++;
					}
					break;

				}
			}

		} else if (ToInsertNodeAction[action] !== undefined) {

			//var node = new XML('<' + ToInsertNodeAction[action] + '>' + '</' + ToInsertNodeAction[action] + '>');
			var node = new XML('<ActionItem></ActionItem>');
			node.@name = ToInsertNodeAction[action];
			moveFiles(i, elements[item], node, ToInsertNodeAction[action]);
			while(NodeStack.length > 0){
				NodeStack.pop();
			}
			NodeStack.push(node);



		}




	}



	file = new File('~/desktop/PhotoshopRecorder/' + file_num + '/Action.xml');
	file.open('w');
	file.write(xml);
	file.close();
}


//判断元素是否在数组中

function isInArray(array, action) {
	var l = array.length;
	for (var item = 0; item < l; item ++) {
		if (array[item] === action)
			return true;

	}
	return false;
}

//保存文件

function moveFiles(index, element, root, action) {
	var f = new Folder(_path + '/' + index);
	if (!f.exists) {
		f.create();
	}
	element['select'].copy(_path + '/' + i + '/select.jpg');
	if (element['layer'] !== undefined) {
		var count = element['layer'].length;
		for (var item = 0; item < count; item ++) {
		//	alert(element['layer'][item].toString());
			element['layer'][item].copy(_path + '/' + index + '/' + element['layer'][item].displayName);
		}
	}
	var area = element['area'].split(',');
	var sa = new XML("<SelectionArea></SelectionArea>");
	sa.@path = _path + '/' + index;
	sa.@left = area[0];
	sa.@top = area[1];
	sa.@right = area[2];
	sa.@bottom = area[3];
	sa.@action = action;

	root.appendChild(sa);

}

function moveFilesAndCreateNode(index, element, root) {
	var f = new Folder(_path + '/' + index);
	if (!f.exists) {
		f.create();
	}
	element['select'].copy(_path + '/' + i + '/select.jpg');
	if (element['layer'] !== undefined) {
		var count = element['layer'].count;
		for (var item = 0; item < count; item ++){
			element['layer'][item].copy(_path + '/' + index + '/' + element['layer'][item].displayName);
		}
	}

	var area = element['area'].split(',');
	var sa = new XML("<SelectionArea></SelectionArea>");
	sa.@path = _path + '/' + index;
	sa.@left = area[0];
	sa.@top = area[1];
	sa.@right = area[2];
	sa.@bottom = area[3];

	root.appendChild(sa);

}