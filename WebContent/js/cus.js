var cusChart;
var cusRegion;
sap.ui.model.json.JSONModel.extend("cus", {

	createCusPage : function(){
      var oCurrent = this;
      cusChart = new sap.viz.ui5.controls.VizFrame({
    	  height : "300px",
    	  uiConfig : "{applicationSet:'fiori'}",
    	  vizType : "pie",
    	  legendVisible : true,
    	  width : "100%"
      });

		var oCusScrollContainerMain = new sap.m.ScrollContainer({
		   focusable : true,
		   height : "100%",
		   horizontal : false,
		   vertical : false,
		   width : "100%",
		   content : [
		              /* Popever */
		              new sap.viz.ui5.controls.Popover({

		              }),

		              /* Pie Chart */
		              cusChart

		              ]
	    });


		var oItemTemplate = new sap.ui.core.Item({
			key : "{key}",
	  		text : "{text}"
		});

		cusRegion = new sap.m.ComboBox({
				items : {
				    path : "/items",
				    template : oItemTemplate
			  	},
			  	selectionChange : [ function(oEvent) {
			  			oCurrent.onCusSelect();
				}, this ]
           });

	  var oCusFlexMain = new sap.m.FlexBox({
		  direction : "Row",
		  justifyContent : "SpaceBetween",
		  items : [
		           /* Combo Box */

		           cusRegion,
		           /* Button */

		           new sap.m.Button({
		        	   text : "Full Dashboard",
		        	   type : sap.m.ButtonType.Unstyled,
		        	   press : function(){
		        		   oCurrent.openCusDash();
		        	   }
		           }).addStyleClass("submitBtn")
		          ]
	  });

	  var oCusFlexFinal = new sap.m.FlexBox({
		  direction : "Column",
		  items : [
		           oCusFlexMain,
		           oCusScrollContainerMain
		           ]
	  });

	  oCurrent.getCusData();
	  return oCusFlexFinal;


	},

	getCusData : function(){

	var oCurrent = this;

//  1.Create a JSON Model and load the data

	//busyDialog.open();

	oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
	var urlCus = serviceUrl + "/custSet";

	OData.request({
	      requestUri: urlCus,
	      method: "GET",
	      dataType: 'json',
	      headers:
	       {
	          "X-Requested-With": "XMLHttpRequest",
	          "Content-Type": "application/json; charset=utf-8",
	          "DataServiceVersion": "2.0",
	          "X-CSRF-Token":"Fetch"
	      }
	    },
	    function (data, response){
	    	//busyDialog.close();
		if(data.results.length == 0){

	    		sap.ui.commons.MessageBox.show("No data found",
                      sap.ui.commons.MessageBox.Icon.WARNING,
                      "Warning",
                      [sap.ui.commons.MessageBox.Action.OK],
                      sap.ui.commons.MessageBox.Action.OK);
	    	}
	    	else{

	    		oDataCusTS = [];
	    		oDataChart = {
	    				'cdash' : []
	    		};

	    		for(var i=0; i<data.results.length; i++){
	    			oDataCusTS.push({
							"Region": data.results[i].Region,
	    				"Credit": data.results[i].Cr.substr(1),
	    				"Number": data.results[i].Noc,
	    				"NBV": data.results[i].Nbv,
	    				"Head": data.results[i].Crh
	    			});
	    		}


	    		// 2. Get distince regions
	    		var regions = oCurrent.getCusDistinctRegions(oDataCusTS);

	    		//3. Extract data only for the first entry in the dropdown

	    		for(var i=0; i<oDataCusTS.length; i++){
	    			//if(oDataCusTS[i].Region == regions[0]){
		    			oDataChart.cdash.push({
		    						"Region": oDataCusTS[i].Region,
				    				"Credit": oDataCusTS[i].Credit,
				    				"Number": oDataCusTS[i].Number,
				    				"NBV": oCurrent.getCusComposition(oDataCusTS[i].NBV, "All"),
				    				"Head": oDataCusTS[i].Head
				    			});
	    			//}
	    		}

	    		var holder = {};

	    		oDataChart.cdash.forEach(function (d) {
	    		    if(holder.hasOwnProperty(d.Credit)) {
	    		       holder[d.Credit] = holder[d.Credit] + parseFloat(d.NBV);
	    		    } else {
	    		       holder[d.Credit] = parseFloat(d.NBV);
	    		    }
	    		});

	    		var obj2 = [];

	    		for(var prop in holder) {
	    		    obj2.push({Credit: prop, NBV: holder[prop]});
	    		}

	    		console.log(obj2);

	    		oDataChart.cdash = obj2;

	    		var oModelChart = new sap.ui.model.json.JSONModel();
	    		oModelChart.setData(oDataChart);

//	          3.Get the id of the VizFrame
	    		var oVizFrame = cusChart;

//	          4. Create Viz dataset to feed to the data to the graph
	    		var oDatasetChart = new sap.viz.ui5.data.FlattenedDataset({
	    			dimensions : [{
	    				axis : 1,
	    			      name : 'Credit Rating',
	    			      value : "{Credit}"}],

	    			measures : [{

	    					name : 'NBV Exposure %',
	    					value : '{NBV}'},

	    					/*{name : 'Number Of Customers',
	    					value : '{Number}'},

	    					{
	    						name : 'Credit Headroom %',
	    						value : '{Head}'}*/

	    					],

	    			data : {
	    				path : "/cdash"
	    			}
	    		});
	    		oVizFrame.setDataset(oDatasetChart);
	    		oVizFrame.setModel(oModelChart);

//	          5.Set Viz properties

	    		oVizFrame.setVizProperties({
	    			title:{
	    				//text : "Customer Dashboard"
	    				text : ""
	    			},
	                plotArea: {
	                	colorPalette : d3.scale.category20().range(),
	                	drawingEffect: "glossy"
	            }});

	    		var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
	    		      'uid': "size",
	    		      'type': "Measure",
	    		      'values': ["NBV Exposure %"]
	    		    });
	    		oVizFrame.addFeed(feedSize);

	    		var feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
	    		      'uid': "color",
	    		      'type': "Dimension",
	    		      'values': ["Credit Rating"]
	    		    });

	    		oVizFrame.addFeed(feedColor);


	    		// 6. Set region combobox
	    		oCurrent.setCusComboModel(regions);

				}
		},
		function(err){
	    	 //busyDialog.close();
	    	 //errorfromServer(err);
	    	 //alert("Error in data read from SAP");
	    });

	/*var oModelChart = new sap.ui.model.json.JSONModel();
	var data = {
		'cdash' : [{
			  "Credit": "A",
			  "Number": "6",
			  "NBV": "4.2",
			  "Head": "10.6",
			}, {
				   "Credit": "B",
				  "Number": "87",
				  "NBV": "20.5",
				  "Head": "28.1",
			}, {
				"Credit": "C1",
				  "Number": "444",
				  "NBV": "65.5",
				  "Head": "49.9",
			}, {
				"Credit": "C2",
				  "Number": "22",
				  "NBV": "2.6",
				  "Head": "0.8",
			}, {
				"Credit": "C3",
				  "Number": "127",
				  "NBV": "0.2",
				  "Head": "0.3",
			},

			{
				"Credit": "E",
				  "Number": "7",
				  "NBV": "0.7",
				  "Head": "0.6",
			},

			{
				"Credit": "P",
				  "Number": "9",
				  "NBV": "0.0",
				  "Head": "0.1",
			},

			{
				"Credit": "S1",
				  "Number": "29",
				  "NBV": "1.9",
				  "Head": "1.1",
			},

			{
				"Credit": "S2",
				  "Number": "20",
				  "NBV": "0.2",
				  "Head": "0.5",
			},

			{
				"Credit": "S3",
				  "Number": "21",
				  "NBV": "1.5",
				  "Head": "6.4",
			},

			{
				"Credit": "U",
				  "Number": "27",
				  "NBV": "2.7",
				  "Head": "1.7",
			}
			]};
	oModelChart.setData(data);

//  3. Create Viz dataset to feed to the data to the graph
	var oDataset = new sap.viz.ui5.data.FlattenedDataset({
		dimensions : [{
			axis : 1,
		        name : 'Credit Rating',
			value : "{Credit}"}],

		measures : [{

				name : 'NBV Exposure %',
				value : '{NBV}'},

				{name : 'Number Of Customers',
				value : '{Number}'},

				{
					name : 'Credit Headroom %',
					value : '{Head}'}

				],

		data : {
			path : "/cdash"
		}
	});
	oVizFrame.setDataset(oDataset);
	oVizFrame.setModel(oModel);

//  4.Set Viz properties
	oVizFrame.setVizProperties({
		title:{
			text : "Customer Dashboard"
		},
        plotArea: {
        	colorPalette : d3.scale.category20().range(),
        	drawingEffect: "glossy"
    }});

	var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
	      'uid': "size",
	      'type': "Measure",
	      'values': ["NBV Exposure %"]
	    });
	oVizFrame.addFeed(feedSize);

	var feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
	      'uid': "color",
	      'type': "Dimension",
	      'values': ["Credit Rating"]
	    });

	oVizFrame.addFeed(feedColor);

	oCurrent.setComboModel();*/

	/* ******************************	************************************	**********************************	*/

	/*var oModel = new sap.ui.model.json.JSONModel();
	var data = {
		'cdash' : [{
			  "Credit": "A",
			  "Number": "6",
			  "NBV": "4.2",
			  "Head": "10.6",
			}, {
				   "Credit": "B",
				  "Number": "87",
				  "NBV": "20.5",
				  "Head": "28.1",
			}, {
				"Credit": "C1",
				  "Number": "444",
				  "NBV": "65.5",
				  "Head": "49.9",
			}, {
				"Credit": "C2",
				  "Number": "22",
				  "NBV": "2.6",
				  "Head": "0.8",
			}, {
				"Credit": "C3",
				  "Number": "127",
				  "NBV": "0.2",
				  "Head": "0.3",
			},

			{
				"Credit": "E",
				  "Number": "7",
				  "NBV": "0.7",
				  "Head": "0.6",
			},

			{
				"Credit": "P",
				  "Number": "9",
				  "NBV": "0.0",
				  "Head": "0.1",
			},

			{
				"Credit": "S1",
				  "Number": "29",
				  "NBV": "1.9",
				  "Head": "1.1",
			},

			{
				"Credit": "S2",
				  "Number": "20",
				  "NBV": "0.2",
				  "Head": "0.5",
			},

			{
				"Credit": "S3",
				  "Number": "21",
				  "NBV": "1.5",
				  "Head": "6.4",
			},

			{
				"Credit": "U",
				  "Number": "27",
				  "NBV": "2.7",
				  "Head": "1.7",
			}
			]};
	oModel.setData(data);


	  var oVizFrame = this.getView().byId("idVizFramePieCus");
	  var oPopOver = this.getView().byId("idPopOver");
	  //var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZCP_AP_INVOICE_GW_SRV", true);
	  //oModel.read("/invoiceSet", {
	  //success: function() {


	  var oDataset = new sap.viz.ui5.data.FlattenedDataset({
			dimensions : [{
			        name : 'Credit Rating',
				value : "{Credit}"}],

			measures : [{
					//group:1,
					name : 'NBV Exposure %',
					value : '{NBV}'},

					{//group:1,
						name : 'Number Of Customers',
					value : '{Number}'},

					{	//group:1,
						name : 'Credit Headroom %',
						value : '{Head}'}

					],

			data : {
				path : "/cdash"
			}
		});
		oVizFrame.setDataset(oDataset);
		oVizFrame.setModel(oModel);

		  var feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
			  'uid': "categoryAxis",
			  'type': "Dimension",
			  'values': ["Credit Rating"]
			  });

			  oVizFrame.addFeed(feedColor);

	  var feedSize1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
		  'id':"value1",
	  'uid': "primaryValues",
	  'type': "Measure",
	  'values': ["NBV Exposure %"]
	  });
	  oVizFrame.addFeed(feedSize1);

	  var feedSize2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
		  'id':"value2",
		  'uid': "primaryValues",
		  'type': "Measure",
		  'values': ["Number Of Customers"]
		  });
		  oVizFrame.addFeed(feedSize2);

		  var feedSize3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
			  'id':"value3",
			  'uid': "primaryValues",
			  'type': "Measure",
			  'values': ["Credit Headroom %"]
			  });
			  oVizFrame.addFeed(feedSize3);*/
	},

	onCusSelect : function(oEvent){
		var oCurrent = this;
		var regionkey = oEvent.getParameters("selectedItem").selectedItem.getProperty("key");
		//var regiontext = oEvent.getParameters("selectedItem").selectedItem.getProperty("text");
		oDataChart.cdash = [];
		if(regionkey == "All"){
			for(var i=0; i<oDataCusTS.length; i++){
	    			oDataChart.cdash.push({
	    						"Region": oDataCusTS[i].Region,
			    				"Credit": oDataCusTS[i].Credit,
			    				"Number": oDataCusTS[i].Number,
			    				"NBV": oCurrent.getCusComposition(oDataCusTS[i].NBV, "All"),
			    				"Head": oDataCusTS[i].Head
			    			});

	    			var holder = {};

		    		oDataChart.cdash.forEach(function (d) {
		    		    if(holder.hasOwnProperty(d.Credit)) {
		    		       holder[d.Credit] = holder[d.Credit] + parseFloat(d.NBV);
		    		    } else {
		    		       holder[d.Credit] = parseFloat(d.NBV);
		    		    }
		    		});

		    		var obj2 = [];

		    		for(var prop in holder) {
		    		    obj2.push({Credit: prop, NBV: holder[prop]});
		    		}

		    		console.log(obj2);

		    		oDataChart.cdash = obj2;
			}
		}else{
			for(var i=0; i<oDataCusTS.length; i++){
				if(oDataCusTS[i].Region == regionkey){
	    			oDataChart.cdash.push({
	    						"Region": oDataCusTS[i].Region,
			    				"Credit": oDataCusTS[i].Credit,
			    				"Number": oDataCusTS[i].Number,
			    				"NBV": oCurrent.getCusComposition(oDataCusTS[i].NBV, oDataCusTS[i].Region),
			    				"Head": oDataCusTS[i].Head
			    			});
				}
			}
		}


		var oModelChart = new sap.ui.model.json.JSONModel();
		oModelChart.setData(oDataChart);

//      3.Get the id of the VizFrame
		var oVizFrame = cusChart;

//      4. Create Viz dataset to feed to the data to the graph
		var oDatasetChart = new sap.viz.ui5.data.FlattenedDataset({
			dimensions : [{
				axis : 1,
			        name : 'Credit Rating',
				value : "{Credit}"}],

			measures : [{

					name : 'NBV Exposure %',
					value : '{NBV}'},

					{name : 'Number Of Customers',
					value : '{Number}'},

					{
						name : 'Credit Headroom %',
						value : '{Head}'}

					],

			data : {
				path : "/cdash"
			}
		});
		oVizFrame.setDataset(oDatasetChart);
		oVizFrame.setModel(oModelChart);

	},

	openCusDash : function(){
		window.open("http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AQzakHGcK7VBi9kqQyI3CwY");
	},

	setCusComboModel : function(regions) {

		var ddlRegionData = [];
		ddlRegionData.push({
			key : 'All',
			text : 'All'
		});

		for(var i=0; i<regions.length; i++){
			ddlRegionData.push({
				key : regions[i],
				text : regions[i]
			});
		}

		var oDdlRegionModel = new sap.ui.model.json.JSONModel();
        oDdlRegionModel.setSizeLimit(99999);
        oDdlRegionModel.setData({data:ddlRegionData});

        var oComboRegion = cusRegion;
        oComboRegion.setModel(oDdlRegionModel);
        oComboRegion.bindItems("/data", new sap.ui.core.ListItem({text: "{text}", key:"{key}"}));
        oComboRegion.setSelectedKey(ddlRegionData[0].key);
	},

	getCusDistinctRegions : function(input){
		var flags = [], output = [], l = input.length, i;
		for( i=0; i<l; i++) {
		    if( flags[input[i].Region]) continue;
		    flags[input[i].Region] = true;
		    output.push(input[i].Region);
		}

		return output;
	},

	getCusComposition : function(nbv, region){

		var compos = 0.00;

		if(region == "All"){
			for(var j=0; j<oDataCusTS.length; j++){
					compos = compos + parseFloat(oDataCusTS[j].NBV);
			}
		}else{
			for(var j=0; j<oDataCusTS.length; j++){
				if(oDataCusTS[j].Region == region){
					compos = compos + parseFloat(oDataCusTS[j].NBV);
				}
			}
		}

		compos = ( nbv / compos ) * 100;
		compos = thousandsep(compos);
		return compos;
	}

});

function thousandsep(value){
    /*value = parseFloat(value);
     value = parseFloat(value.toFixed(2)).toLocaleString('en');
     if(value.split('.').length == 1){
     value = value + ".00";
     }else{
     if(value.split('.')[1].length == 1){
     value = value + "0";
     }
     };
     return value;*/
    value = parseFloat(value);
    value = Globalize.format(value, 'n2', 'en');
    return value;
}
