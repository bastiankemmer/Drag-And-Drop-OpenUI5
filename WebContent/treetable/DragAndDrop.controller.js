sap.ui.controller("treetable.DragAndDrop", {

	    itemClassName : null,
	    oMightyController: null,
	    dropped: false,
	    appView: null,
	    currentObjectPath: null,
	    myMap: new Map(),
	    oFormView: new Object({
	        content: new Array()
	    }),
	    random: 1,
	    oTreeTable: null,


	    onInit: function(oEvent){
	        oMightyController = this;
	        if(oMightyController.oModel === undefined){
	        	itemClassName = "someTestClassName";
				
		        var data = new Object(
						{
						  "items": {
							"Button": {
							  "Type": "sap.m.Button",
							  "id": "",
							  "text": "",
							  "press": ""
							},
							"Label": {
							  "Type": "sap.m.Label",
							  "id": "",
							  "text": ""
							},
							"Text": {
							  "Type": "sap.m.Text",
							  "id": "",
							  "text": ""
							},
							"Panel": {
							  "Type": "sap.m.Panel",
							  "id": "",
							  "headerText": "",
							  "content": []
							}
						  },
						}
					);
				
		        oMightyController.configureToolbox(oEvent, data);
	        }
	    },

	    onAfterRenderingTable: function(oEvent) {
	        oMightyController.makeTableRowsDroppable();

	        var oRows = oTreeTable.getRows();

	        $.each(oRows, function(key, value){
	            oTreeTable.expand(key);
	        });
	    },

	    onAfterRendering: function(oEvent) {
	    	
	        var oModelTreeTable = new sap.ui.model.json.JSONModel();
	        oModelTreeTable.setData(oMightyController.oFormView.content);

	        oTreeTable = oMightyController.oView.byId('TableTree');
	        oTreeTable.attachRowSelectionChange(oMightyController.rowSelected);
	        oTreeTable.setVisibleRowCount(1);
	        oTreeTable.setModel(oModelTreeTable);
	        oTreeTable.setShowNoData(false);
	        oTreeTable.bindRows("/");
	        oTreeTable.setExpandFirstLevel(true);

	        oTreeTable.addEventDelegate({
	            onAfterRendering: oMightyController.onAfterRenderingTable
	        }, this);

	        oMightyController.makeTableRowsDroppable();

	        oMightyController.addDraggableToToolbox();
	    },

	    rowSelected: function(oEvent){
	        console.log("Row selected");
	        console.log(oEvent.getSource());
	    },

	    configureToolbox: function(oEvent, data){
	        oMightyController.oView = oEvent.getSource();
	        oMightyController.oModel = new sap.ui.model.json.JSONModel();
	        oMightyController.oModel.setData(data);

	        var content = data;
	        var tree = oMightyController.oView.byId("Tree");
	      //Loop over first level (Types - Fields, Groups)
	        for (var key in content) {
	            var type = content[key];
	            var oTreeNode = new sap.ui.commons.TreeNode({
	                text: key
	            });
	            //Loop over content (button, label, text..., panel)
	            for (var type_key in type) {
	                var treeItem = new sap.ui.commons.TreeNode(itemClassName+type_key, {
	                    text: type_key
	                });

	                treeItem.addStyleClass(itemClassName);
	                treeItem.bindObject("/"+key+"/"+type_key);
	                oTreeNode.addNode(treeItem);
	                if(key.toLowerCase() === "groups"){
	                    treeItem.addStyleClass("treeGroup");
	                }else if(key.toLowerCase() === "fields"){
	                    treeItem.addStyleClass("treeField");
	                }
	            }

	            tree.addNode(oTreeNode);
	        }
	        oMightyController.oView.setModel(oMightyController.oModel);
	        oMightyController.oView.bindObject("/");
	    },

	    addDraggableToToolbox : function(){
	        var items = $("." + itemClassName);
	        items.each(function(index){

	            $(this).attr("draggable", true);

	            $(this).on('dragstart', oMightyController.handleDragstart);
	        });
	    },

	    handleDragstart : function(e){
	        //TODO: Add css here
	        e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(oMightyController.getObjectById(e.currentTarget.id)));
	    },

	    makeTableRowsDroppable : function(){
	        var oRows = oTreeTable.getRows();

	        $.each(oRows, function(key, value){
	            $("#"+value.sId).attr("droppable", true);

	            $("#"+value.sId).on('drop', oMightyController.handleDrop);

	            $("#"+value.sId).on('dragenter', oMightyController.handleDragenter);

	            console.log("Before Dragover");
	            $("#"+value.sId).on('dragover', oMightyController.handleDragover);
	            console.log(oMightyController.handleDragover);

	            $("#"+value.sId).on('dragleave', oMightyController.handleDragleave);

	        });
	    },

	    handleDrop : function(e){
	        //TODO: Add css here
	        if (e.stopPropagation) {
	            e.stopPropagation(); // Stops some browsers from redirecting.
	        }
	        var sObj = e.originalEvent.dataTransfer.getData('text/plain');

	        var oRows = oTreeTable.getRows();

	        $.each(oRows, function(key, value) {
	            if(value.sId === e.currentTarget.id){
	                oTreeTable.setSelectedIndex(e.currentTarget.rowIndex - 1);
	                oMightyController.addRowToTable(JSON.parse(sObj), oTreeTable.getModel().getProperty(value.getBindingContext().sPath));

	                return false;
	            }
	        });

	        return false;
	    },

	    handleDragenter : function(e){
	        //TODO: Add css here
	    },

	    handleDragover : function(e){
	        console.log("Dragover");
	        if (e.preventDefault) {
	            e.preventDefault(); // Necessary. Allows us to drop.
	        }

	        console.log("DragOver");
	        var offset = $("#" + e.currentTarget.id).offset();
	        console.log("left: " + offset.left + ", top: " + offset.top);

	        //TODO: Add css here
	    },

	    addEmptyObject: function(oNode, oFormObject){
	        for(var key in oNode){
	            oFormObject[key] = "";
	            if(oNode[key].constructor === Array){
	                oNode[key].push(oFormObject);
	            }
	        }
	    },

	    handleDragleave : function(e){
	        //TODO: Add css here
	    },

	    //newObject: Item das wir adden möchten
	    //itemTyp: "treeGroup" oder "treeField"
	    //target: group
	    addRowToTable : function(newObject, targetRow){
	        if(targetRow.constructor === Array){
	            oMightyController.oFormView.content.push(newObject);
	        }else{
	            oMightyController.depthFirstSearchAndAppendToForm(oMightyController.oFormView.content, targetRow, newObject);
	        }

	        oTreeTable.bindRows("/");
	        oTreeTable.setVisibleRowCount(oTreeTable.getRows().length + 1);
	    },

	    deleteRowFromTable : function(rowID){

	    },

	    getObjectById : function(oID){
	        var obj = oMightyController.oModel.getProperty(sap.ui.getCore().byId(oID).getBindingContext().sPath);
	        obj.id = "testId" + oMightyController.random;
	        oMightyController.random += 1;
	        obj.text = "testText";
	        return obj;
	    },

	    /***
	     * Depth-First Search to find the right node inside of the Model to add Content
	     * @param node	Model of TreeTable (first node oFormView.content)
	     * @param goal	The Object where we are aiming to append a Control
	     * 				The Object which is bound to the TreeTable Row which invoked the Drop Event
	     * @param newObject	New Object to bind to the Model
	     * @returns true if it has appended the new Object to the Model otherwise its result is false
	     */
	    depthFirstSearchAndAppendToForm: function(node, goal, newObject){
	        for(var content in node){
	            var contentObj = node[content];
	            if(contentObj.id === goal.id){
	                var arrayKey = oMightyController.findArrayInObject(contentObj);

	                if(arrayKey !== -1){
	                    contentObj[arrayKey].push(newObject);
	                } else {
	                    oMightyController.addObjectBefore(node, goal, newObject);
	                }
	                return true;
	            } else{
	                var key = oMightyController.findArrayInObject(contentObj);
	                if(key !== -1){
	                    var result = oMightyController.depthFirstSearchAndAppendToForm(contentObj[key], goal, newObject);
	                    if(result !== false && result.id === goal.id){
	                        return result;
	                    }
	                }
	            }
	        }
	        return false;
	    },

	    addObjectBefore: function(node, goal, newObject){
	        var index = -1;
	        $.grep(node, function( n, i ) {
	            if(n.id === goal.id){
	                index = i;
	            }
	            return false;
	        });
	        node.splice(index, 0, newObject);
	    },

	    findArrayInObject: function(contentObj){
	        for(var key in contentObj){
	            if(contentObj[key].constructor === Array){
	                return key;
	            }
	        }
	        return -1;
	    }

});