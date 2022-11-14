sap.ui.define([
    "../lib/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/m/MessageBox",
    "sap/ui/core/format/NumberFormat"
    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FlattenedDataset, FeedItem, MessageBox, NumberFormat) {
        "use strict";

        return Controller.extend("SYNC.zdcsdui5vbr.controller.Main", {
            onInit: function () {
                const oComponent = this.getOwnerComponent(),
                oRouter = oComponent.getRouter();

                this._setInitModel();
                this._datePicker = this.byId('startDatePicker');
                // this._dateLabel = this.byId('startDateLabel');
                this._dynamicPage = this.byId('D_dynamicPage');
                
                let datePicker = this._datePicker,
                    today = new Date(),  
                    year = today.getFullYear(), //년도
                    month = today.getMonth();  // 전 달

                datePicker.setValue(String(year) + '-' + String(month));
                
                this.aMonth = String(month);
                // this.aMonth = '10';

                this._jsonKeyName = "sig_map", // TL_SCCO_CTPRVN // MAP
                this._name = this._jsonKeyName === 'sig_map' ? 'SIG_KOR_NM' : 'loc_nm' ;
                this._cd = this._jsonKeyName === 'sig_map' ? 'SIG_CD' : 'loc_cd' ;
            
            },

            onAfterRendering : function(){
                let sKey = "line";
                this._setvizframeVbrp(sKey);
                // this._geoJSONLoad().then(
                //         function() {
                //             $.getScript(
                //                 "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=a6d401791f1e092de9c012e25039c5ee&libraries=services",
                //                 this.initMap.bind(this)
                //             )
                //         }.bind(this)
                //     );
            },           
            /**
             * 해당 화면에 대한 초기 모델 생성 함수
             */
            _setInitModel: function() {
                let aChartType = this._getChartType();
                // var foodData = {
                //         food : [
                //         {
                //             month : "1월",

                //         },
                //         {
                //             month : "2월"
                //         },
                //         {
                //             month : "3월"
                //         },
                //         {
                //             month : "4월"
                //         },
                //         {
                //             month : "5월"
                //         },
                //         {
                //             month : "6월"
                //         },
                //         {
                //             month : "7월"
                //         },
                //         {
                //             month : "8월"
                //         },
                //         {
                //             month : "9월"
                //         },
                //         {
                //             month : "10월"
                //         },{
                //             month : "11월"
                //         },{
                //             month : "12월"
                //         }
                //         ] 
                //     };
                var ofoodData = [];
                for(let i = 1 ; i < 13 ; i ++)
                {
                    ofoodData.push(
                        {
                            "월": i+"월",
                            "감바스": 0,
                            "김치찌개": 0,
                            "닭가슴살 커리": 0,
                            "미나리 크림 파스타": 0,
                            "밀푀유나베": 0,
                            "소고기 두부면": 0,
                            "스테이크 세트": 0,
                            "콥 샐러드": 0
                        }
                    );
                }
                var foodData = { 
                    food : []
                };
                foodData.food = ofoodData;

                var ozoneData = [];
                for(let i = 1 ; i < 13 ; i ++)
                {
                    ozoneData.push(
                        {
                            "월": i+"월",
                            "서울북부": 0,
                            "서울강남": 0,
                            "서울남부": 0,
                            "서울동부": 0,
                            "서울서부": 0,
                        }
                    );
                }
                var zoneData = { 
                    zone : []
                };
                zoneData.zone = ozoneData;

                var omapData = [];
                omapData.push(
                    {
                        "서울북부": 0,
                        "서울강남": 0,
                        "서울남부": 0,
                        "서울동부": 0,
                        "서울서부": 0,
                    }
                );
                

                this.getView()
                    .setModel(
                        new JSONModel(foodData),
                        "ovbrpModel"
                    );
                this.getView()
                    .setModel(
                        new JSONModel(zoneData),
                        "ovbrkModel"
                    );
                
                this.getView()
                    .setModel(
                        new JSONModel(omapData),
                        "omapModel"
                    );

                this.getView()
                    .setModel(
                        new JSONModel({
                            typeList: aChartType,
                            selectedType: ""
                        }),
                        "DynamicType"
                    );
                
                

                this.getView()
                    .setModel(
                        new JSONModel({
                            geoMap: [],
                            searchList: []
                        }),
                        'kakaoMap'
                    );        
            },
            
            /**
             * 차트 타입을 제공하는 함수
             * @returns {array}
             */
            _getChartType: function() {
                return [
                    // { type: 'bar' },
                    
                    // { type: 'stacked_column' },
                    // { type: 'stacked_bar' },
                    
                    { type: '제품별'},
                    { type: '판매 구역별' },
                ];
            },

            /**
             * 해당 페이지 url에 접근했을 때 실행될 함수.
             * 페이지에 접근시 모델에 데이터 세팅을 해준다.
             */
            _onPatternMatched: function(oEvent) {
                const oArguments = oEvent.getParameter('arguments'),
                      oView = this.getView(),
                      oModel = oView.getModel('DynamicType');

                oModel.setProperty('/selectedType', oArguments.type);

                
                let aItem = this.byId('DynamicType_Select')
                                  .getItems()
                                  .filter((oItem) => { return oItem.getKey() === 'line'} );
                
                this.byId('DynamicType_Select')
                    .fireChange(aItem);
            },
            _setvizframeVbrp(sKey){
                let oView = this.getView(),   
                    oModel = oView.getModel('odataModel'),
                    oVbrpModel = oView.getModel('ovbrpModel'),
                    // deteLabel = this._dateLabel,
                    detePicker = this._datePicker;
                    // deteLabel.setVisible(false);
                    detePicker.setVisible(false);
                    oView.setBusy(true);
                  
                oModel.read("/VbrpSet", {
                    success: function (oData) {
                        let aResult = oData.results;

                        for(let i = 0; i < 12 ; i ++)
                        {
                            
                            oVbrpModel.setProperty(`/food/${i}/${"감바스"}`, 0);
                            oVbrpModel.setProperty(`/food/${i}/${"김치찌개"}`, 0);
                            oVbrpModel.setProperty(`/food/${i}/${"닭가슴살 커리"}`, 0);
                            oVbrpModel.setProperty(`/food/${i}/${"미나리 크림 파스타"}`, 0);
                            oVbrpModel.setProperty(`/food/${i}/${"밀푀유나베"}`, 0);
                            oVbrpModel.setProperty(`/food/${i}/${"소고기 두부면"}`, 0);
                            oVbrpModel.setProperty(`/food/${i}/${"스테이크 세트"}`, 0);
                            oVbrpModel.setProperty(`/food/${i}/${"콥 샐러드"}`, 0);
                        }
                        aResult.forEach(function(value, index, array){ 
                            
                            let fkdatDate = aResult[index].Fkdat.split('-'); 
                            let fkdatMonth = fkdatDate[1];    
                            for(let i = 0; i < oVbrpModel.getProperty('/food').length ; i ++)
                            {
                                let oModelMonth = oVbrpModel.getProperty('/food')[i].월.split('월');
                                let oModelFertname =  aResult[index].Fertname;
                                let oModelPrice =  Number(aResult[index].Total);
                                if(Number(oModelMonth[0]) == Number(fkdatMonth))
                                {
                                    let oModelPriceValue = oVbrpModel.getProperty(`/food/${i}/${oModelFertname}`);
                                    oModelPriceValue = oModelPriceValue + oModelPrice;
                                    oVbrpModel.setProperty(`/food/${i}/${oModelFertname}`, oModelPriceValue);
                                }
                            }
                        });   

                        let oVizFrame = this.byId(sap.ui.core.Fragment.createId("DynamicTypeChart", "staticChart"));
                        oVizFrame.destroyDataset( );    
                        oVizFrame.removeAllFeeds( );
                        
                            let chartTitle = "제품별 월간";    
                            let oDataset = new FlattenedDataset({
                                // stacked_column Section 
                            dimensions: [ 
                                {
                                    name: '월',
                                    value: "{ovbrpModel>월}"
                                }
                            ], 
                        
                            // stacked_column Section Value 
                            measures: [
                                {
                                    name: '감바스',
                                    value: "{ovbrpModel>감바스}"
                                    
                                },
                                {
                                    name: '김치찌개',
                                    value: "{ovbrpModel>김치찌개}"
                                },
                                {
                                    name: '닭가슴살 커리',
                                    value: "{ovbrpModel>닭가슴살 커리}"
                                },
                                {
                                    name: '미나리 크림 파스타',
                                    value: "{ovbrpModel>미나리 크림 파스타}"
                                },
                                {
                                    name: '밀푀유나베',
                                    value: "{ovbrpModel>밀푀유나베}"
                                },
                                {
                                    name: '소고기 두부면',
                                    value: "{ovbrpModel>소고기 두부면}"
                                },
                                {
                                    name: '스테이크 세트',
                                    value: "{ovbrpModel>스테이크 세트}"
                                },
                                {
                                    name: '콥 샐러드',
                                    value: "{ovbrpModel>콥 샐러드}"
                                },

                            ],
            
                                // stacked_column Data Location  
                            data: {
                                    path: "ovbrpModel>/food"
                                    // filters: [ oFilter1, oFilter2 ]
                                }
                            });
                            oVizFrame.setDataset(oDataset);
                            oVizFrame.setModel(oVbrpModel);
            
                            //stacked_column properties
                            oVizFrame.setVizProperties({
                                title: {
                                    visible: true,
                                    style: {
                                        color: 'green'
                                    },
                                    text: chartTitle
                                },
                                legend: {
                                    drawingEffect: 'glossy'
                                },
                            
                                plotArea: {
                                    drawingEffect: 'glossy',
                                    dataLabel: {
                                        visible: true
                                    },
                                    
                                },
                                valueAxis: {
                                    title: {
                                        visible: false
                                    }
                                },
                                categoryAxis: {
                                    title: {
                                        visible: false
                                    }
                                },
                                
                            });

                            let feedvalueAxis= new FeedItem({
                                    'uid': "valueAxis",
                                    'type': "Measure",
                                    'values': [
                                                "감바스",
                                                "김치찌개",
                                                "닭가슴살 커리",
                                                "미나리 크림 파스타",
                                                "밀푀유나베",
                                                "소고기 두부면",
                                                "스테이크 세트",
                                                "콥 샐러드"
                                            ]
                                            
                            });
                        
                            let feedColor = new FeedItem({
                                    'uid': "categoryAxis",
                                    'type': "Dimension",
                                    'values': ["월"]
                            });
                            
                            oVizFrame.addFeed(feedvalueAxis);
                            oVizFrame.addFeed(feedColor);

                            var oPopover = new sap.viz.ui5.controls.Popover({});
                                oPopover.connect(oVizFrame.getVizUid());
                            // oChart.setVizType(sKey);
                            oVizFrame.setVizType(sKey);

                        oView.setBusy(false);
                    }.bind(this),
                    error: function(){
                        oView.setBusy(false);
                    }
                });     

                
            },
            _setvizframeVbrk(sKey){
                let oView = this.getView(),   
                    oModel = oView.getModel('odataModel'),
                    oVbrkModel = oView.getModel('ovbrkModel'),
                    oMapModel = oView.getModel('omapModel'),
                    aMonth = this.aMonth,
                    // deteLabel = this._dateLabel,
                    detePicker = this._datePicker;
                    

                oView.setBusy(true);

                // deteLabel.setVisible(true);
                detePicker.setVisible(true);
                    
                var aVbrkFilters = [];
                    aVbrkFilters.push(new Filter("Fkdat", "EQ", aMonth));


                // read -> getEntity or getEntitySet 
                // 즉 네트워크를 탐
                // 즉 비동기임
                // oModel.read() -> 실행
                // this -> 주최 현재 내가 실행되는 범위
                // function -> this의 의미가달라짐 
                oModel.read("/VbrkSet", {                       
                    filters: aVbrkFilters,
                    success: function (oData) {
                        let aResult = oData.results;

                        for(let i = 0; i < 12 ; i ++)
                        {
                            oVbrkModel.setProperty(`/zone/${i}/${"서울북부"}`, 0);
                            oVbrkModel.setProperty(`/zone/${i}/${"서울강남"}`, 0);
                            oVbrkModel.setProperty(`/zone/${i}/${"서울남부"}`, 0);
                            oVbrkModel.setProperty(`/zone/${i}/${"서울동부"}`, 0);
                            oVbrkModel.setProperty(`/zone/${i}/${"서울서부"}`, 0);
                        }
                        oMapModel.setProperty(`/${"서울북부"}`, 0);
                        oMapModel.setProperty(`/${"서울강남"}`, 0);
                        oMapModel.setProperty(`/${"서울남부"}`, 0);
                        oMapModel.setProperty(`/${"서울동부"}`, 0);
                        oMapModel.setProperty(`/${"서울서부"}`, 0);

                        aResult.forEach(function(value, index, array){ 
                            
                            let fkdatDate = aResult[index].Fkdat.split('-'); 
                            let fkdatMonth = fkdatDate[1]; 
                            for(let i = 0; i < oVbrkModel.getProperty('/zone').length ; i ++)
                            {
                                let oModelMonth = oVbrkModel.getProperty('/zone')[i].월.split('월');
                                let oModelBzirkName =  aResult[index].Bzirk;
                                let oModelPrice =  Number(aResult[index].Netwr);
                                if(Number(oModelMonth[0]) == Number(fkdatMonth))
                                {
                                    let oModelPriceValue = oVbrkModel.getProperty(`/zone/${i}/${oModelBzirkName}`);
                                    oModelPriceValue = oModelPriceValue + oModelPrice;
                                    oVbrkModel.setProperty(`/zone/${i}/${oModelBzirkName}`, oModelPriceValue);
                                    oMapModel.setProperty(`/${oModelBzirkName}`, oModelPriceValue);
                                }
                            }
                        });   
        
                        let oVizFrame = this.byId(sap.ui.core.Fragment.createId("DynamicTypeChart", "staticChart"));
                        oVizFrame.destroyDataset( );    
                        oVizFrame.removeAllFeeds( );
                    
                            let oVbrkFilters = [],
                                sMonth = aMonth+"월",
                                chartTitle = `${sMonth} 판매 구역`;    
                                oVbrkFilters.push(new Filter("월", "EQ", sMonth));
                                
                            let oDataset = new FlattenedDataset({
                            measures: [
                                
                                    {
                                        name: '서울북부',
                                        value: "{ovbrkModel>서울북부}"
                                        
                                    },
                                    {
                                        name: '서울강남',
                                        value: "{ovbrkModel>서울강남}"
                                    },
                                    {
                                        name: '서울남부',
                                        value: "{ovbrkModel>서울남부}"
                                    },
                                    {
                                        name: '서울동부',
                                        value: "{ovbrkModel>서울동부}"
                                    },
                                    {
                                        name: '서울서부',
                                        value: "{ovbrkModel>서울서부}"
                                    },
                                
                                ],

                                // Pid Data Location  
                            data: {
                                    path: "ovbrkModel>/zone",
                                    filters: [ oVbrkFilters ]
                                }
                            });

                            oVizFrame.setDataset(oDataset);
                            oVizFrame.setModel(oVbrkModel);

                            
                            //Pie properties
                            oVizFrame.setVizProperties({
                                title: {
                                    visible: true,
                                    style: {
                                        color: 'green'
                                    },
                                    text: chartTitle
                                },
                                legend: {
                                    drawingEffect: 'glossy'
                                },
                                plotArea: {
                                    drawingEffect: 'glossy',
                                    dataLabel: {
                                        visible: true
                                    },
                                    
                                },
                                valueAxis: {
                                    title: {
                                        visible: false
                                    }
                                },
                                categoryAxis: {
                                    title: {
                                        visible: false
                                    }
                                },
                            });

                            var feedSize = new FeedItem({
                                'uid': "size",
                                'type': "Measure",
                                'values': [
                                                // "판매 금액"
                                                "서울북부",
                                                "서울강남",
                                                "서울남부",
                                                "서울동부",
                                                "서울서부",
                                        ]
                            });

                            oVizFrame.addFeed(feedSize);
                            // oVizFrame.addFeed(feedColor);
                            
                            

                        var oPopover = new sap.viz.ui5.controls.Popover({});
                            oPopover.connect(oVizFrame.getVizUid());
                        // oChart.setVizType(sKey);
                        oVizFrame.setVizType(sKey);
                        this._addAppendLengend();
                        this._geoJSONLoad().then(
                            function() {
                                $.getScript(
                                    "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=a6d401791f1e092de9c012e25039c5ee&libraries=services",
                                    this.initMap.bind(this)
                                )
                            }.bind(this)
                        );        
                        oView.setBusy(false);
                    }.bind(this),
                    error: function(){
                        oView.setBusy(false);
                    }
                });    
                
   

                
            },
            /**
             * 차트 타입 변경 이벤트
             * 차트 타입을 변경하면 해당 변경된 차트로 나타나게 만든다.
             * @param {sap.ui.base.Event} oEvent 
             */
            onTypeChange: function(oEvent) {
                const oControl = oEvent.getSource(),
                      sKey = oControl.getSelectedKey(),
                      oChart = this.getControl({
                        alias: 'DynamicTypeChart',
                        controlid: 'staticChart'
                      });
                let sVizframeType,
                    cMap = this.getView().byId("map"),
                    cChart = this.getView().byId("chart");      

                if(sKey == '제품별'){
                    sVizframeType = 'line';  
                    cChart.setLayoutData(new sap.ui.layout.GridData({
                        span: "XL12 L12 M12 S12"
                      }));
                    this._setvizframeVbrp(sVizframeType);
                    
                    cMap.setVisible(false);
                }else if(sKey == '판매 구역별'){
                    sVizframeType = 'donut';
                    cChart.setLayoutData(new sap.ui.layout.GridData({
                        span: "XL6 L6 M6 S6"
                      }));
                    this._setvizframeVbrk(sVizframeType);
                    
                    // this._geoJSONLoad().then(
                    //     function() {
                    //         $.getScript(
                    //             "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=a6d401791f1e092de9c012e25039c5ee&libraries=services",
                    //             this.initMap.bind(this)
                    //         )
                    //     }.bind(this)
                    // );
                    
                    cMap.setVisible(true);  
                }
                    
                
            },

            onDatePickerChange: function(oEvent) {

                let aMonth = oEvent.getParameter("value");
                 
                    // oVizFrame = this.byId(sap.ui.core.Fragment.createId("DynamicTypeChart", "staticChart")),
                    // oBinding = oVizFrame.getDataset().getBinding("data");
                
                this.aMonth = aMonth;
                this._setvizframeVbrk('donut');
                
                // var aFilters = [];
                // aFilters.push(new Filter("Fkdat", "EQ", aMonth));
                
                // oBinding.filter(new Filter({filters: aFilters, and: true})); 
            },

            _geoJSONLoad: async function() {
                const oMapModel = this.getView().getModel('kakaoMap');
                
                const jsonModel = new JSONModel();
                await jsonModel.loadData("../json/sig_map.json");

                oMapModel.setProperty('/geoMap', jsonModel.getData());
            },
            _addAppendLengend: function() {
                var oMapDom = this.byId('map').getDomRef();
                // debugger;

                oMapDom.insertAdjacentHTML(
                    "afterbegin", // HTML 요소가 삽입되는 위치 선언
                    `<div class="category">
                        <span class="titledesign">매출액 범주</span>
                        <ul class="uldesign">                            
                            <li>
                                <div class="checkDiv redColor"></div>
                                <span>4천만원 이상</span>
                            </li>
                            <li>
                                <div class="checkDiv blueColor"></div>
                                <span>3천만원 이상 4천만원 미만</span>
                            </li>
                            <li>
                                <div class="checkDiv yellowColor"></div>
                                <span>3천만원 미만</span>
                            </li>
                        </ul>
                    </div>`
                    
                    // `<div class="chart-div">
                    //     <canvas id="pieChartCanvas" width="300px" height="300px"></canvas>
                    //     <div id='legend-div' class="legend-div"></div>
                    // </div>`
                );
            },
            _displayArea: function(area, map, customOverlay, infowindow) {
                // 다각형을 생성합니다 
                var polygon = new kakao.maps.Polygon({
                    map: map, // 다각형을 표시할 지도 객체
                    path: area.path,
                    strokeWeight: 2,
                    strokeColor: '#FFE6FF',
                    strokeOpacity: 0.8,
                    fillColor: '#FFE6FF',
                    fillOpacity: 0.7 
                });

                polygon.setMap(map);
                
            },

            _includeKakaoApi: function() {
                jQuery.sap.includeScript(
                    "//dapi.kakao.com/v2/maps/sdk.js?appkey=470a7c2ea301e96ca353f89dfb8d4ac9",
                    "kakaoMap", //id that should be used for the script tag, 
                    function() {
                      this.initMap();	
                    }.bind(this),
                    function() {
                      alert("Load Googlemaps failed!");
                    }
                  );
            },

            // onSearch: function(oEvent) {
            //     // debugger;
            //     // 장소 검색 객체를 생성합니다
            //     var ps = new kakao.maps.services.Places();
            //     var keyword = oEvent.getParameter('query');

            //     if (!keyword.replace(/^\s+|\s+$/g, '')) {
            //         alert('키워드를 입력해주세요!');
            //         return false;
            //     }

            //     // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
            //     ps.keywordSearch( keyword, this.placesSearchCB.bind(this) ); 
            // },

            // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
            placesSearchCB: function(data, status, pagination) {
                const oView = this.getView(),
                      oMapModel = oView.getModel('kakaoMap');
                
                // debugger;
                if (status === kakao.maps.services.Status.OK) {

                    
                    oMapModel.setProperty('/searchList', data);
                    // 정상적으로 검색이 완료됐으면

                    // 검색 목록과 마커를 표출합니다
                    displayPlaces(data);
            
                    // 페이지 번호를 표출합니다
                    displayPagination(pagination);
            
                } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            
                    alert('검색 결과가 존재하지 않습니다.');
                    return;
            
                } else if (status === kakao.maps.services.Status.ERROR) {
            
                    alert('검색 결과 중 오류가 발생했습니다.');
                    return;
            
                }
            },

            // 검색 결과 목록과 마커를 표출하는 함수입니다
            displayPlaces: function(places) {
                var listEl = document.getElementById('placesList'), 
                menuEl = document.getElementById('menu_wrap'),
                fragment = document.createDocumentFragment(), 
                bounds = new kakao.maps.LatLngBounds(), 
                listStr = '';
                
                // 검색 결과 목록에 추가된 항목들을 제거합니다
                removeAllChildNods(listEl);

                // 지도에 표시되고 있는 마커를 제거합니다
                removeMarker();
                
                for ( var i=0; i<places.length; i++ ) {

                    // 마커를 생성하고 지도에 표시합니다
                    var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
                        marker = addMarker(placePosition, i), 
                        itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

                    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
                    // LatLngBounds 객체에 좌표를 추가합니다
                    bounds.extend(placePosition);

                    // 마커와 검색결과 항목에 mouseover 했을때
                    // 해당 장소에 인포윈도우에 장소명을 표시합니다
                    // mouseout 했을 때는 인포윈도우를 닫습니다
                    (function(marker, title) {
                        kakao.maps.event.addListener(marker, 'mouseover', function() {
                            displayInfowindow(marker, title);
                        });

                        kakao.maps.event.addListener(marker, 'mouseout', function() {
                            infowindow.close();
                        });


                        itemEl.onmouseover =  function () {
                            displayInfowindow(marker, title);
                        };

                        itemEl.onmouseout =  function () {
                            infowindow.close();
                        };
                    })(marker, places[i].place_name);

                    
                    fragment.appendChild(itemEl);
                }

                // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
                listEl.appendChild(fragment);
                menuEl.scrollTop = 0;

                // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
                map.setBounds(bounds);
            },

            _makeList: function(data) {
                const oList = this.byId('list');
                oList.removeAllItems();

                data.forEach( (item) => {
                    oList.addItem(
                        
                    );
                } )
            },

            _getArea: function(geoJSON) {

                let aArea = geoJSON.map((oGeo) => {
                    return {
                        name : oGeo.properties.CTP_KOR_NM,
                        path: oGeo.geometry.coordinates[0].map((coordinate) => {
                            return new kakao.maps.LatLng(coordinate[1], coordinate[0])
                        })
                    };
                });

                return geoJSON;

                return [
                    {
                        name : '용산구',
                        path : [
                            new kakao.maps.LatLng(37.5548768201904, 126.96966524449994),
                            new kakao.maps.LatLng(37.55308718044556, 126.97642899633566),
                            new kakao.maps.LatLng(37.55522076659584, 126.97654602427454),
                            new kakao.maps.LatLng(37.55320655210504, 126.97874667968763),
                            new kakao.maps.LatLng(37.55368689494708, 126.98541456064552),
                            new kakao.maps.LatLng(37.54722934282707, 126.995229135048),
                            new kakao.maps.LatLng(37.549694559809545, 126.99832516302801),
                            new kakao.maps.LatLng(37.550159406110104, 127.00436818301327),
                            new kakao.maps.LatLng(37.54820235864802, 127.0061334023129),
                            new kakao.maps.LatLng(37.546169758665414, 127.00499711608721),
                            new kakao.maps.LatLng(37.54385947805103, 127.00727818360471),
                            new kakao.maps.LatLng(37.54413326436179, 127.00898460651953),
                            new kakao.maps.LatLng(37.539639030116945, 127.00959054834321),
                            new kakao.maps.LatLng(37.537681185520256, 127.01726163044557),
                            new kakao.maps.LatLng(37.53378887274516, 127.01719284893274),
                            new kakao.maps.LatLng(37.52290225898471, 127.00614038053493),
                            new kakao.maps.LatLng(37.51309192794448, 126.99070240960813),
                            new kakao.maps.LatLng(37.50654651085339, 126.98553683648308),
                            new kakao.maps.LatLng(37.50702053393398, 126.97524914998174),
                            new kakao.maps.LatLng(37.51751820477105, 126.94988506562748),
                            new kakao.maps.LatLng(37.52702918583156, 126.94987870367682),
                            new kakao.maps.LatLng(37.534519656862926, 126.94481851935942),
                            new kakao.maps.LatLng(37.537500243531994, 126.95335659960566),
                            new kakao.maps.LatLng(37.54231338779177, 126.95817394011969),
                            new kakao.maps.LatLng(37.54546318600178, 126.95790512689311),
                            new kakao.maps.LatLng(37.548791603525764, 126.96371984820232),
                            new kakao.maps.LatLng(37.55155543391863, 126.96233786542686),
                            new kakao.maps.LatLng(37.5541513366375, 126.9657135934734),
                            new kakao.maps.LatLng(37.55566236579088, 126.9691850696746),
                            new kakao.maps.LatLng(37.5548768201904, 126.96966524449994)
                        ]
                    }
                ];
            },
            _testData: function() {
                return [
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                    { address: '종로구', total: 20000 },
                ];
            },
            /**
             * Polygon을 그려주는 기능
             * @param {object} Feature 
             * @param {object} map 
             * @param {*} drawingOptions 
             * @param {*} customOverlay 
             */
             _getPoloycode: function(Feature, map, drawingOptions, customOverlay, infowindow ) {
                var _that = this;
                var geometry = Feature.geometry;
                let oView = this.getView(),   
                            oMapModel = oView.getModel('omapModel');

                function setPolygon(data){ 
                    var polygon = new kakao.maps.Polygon({
                        name: data.name,
                        path : data.path,
                        strokeWeight: 0.9,
                        strokeColor: '#756EFA',
                        strokeOpacity: 0.8,
                        // fillColor: '#fff',
                        fillOpacity: 0.8
                    });
                    let price = oMapModel.getProperty(`/${data.name}`),
                        dataColor;
                    
                    if(price <= 30000000)
                        dataColor = '#69CDF0';
                    else if(price <= 40000000)
                        dataColor = '#6EB1FA';
                    else if(price > 40000000)
                        dataColor = '#6F89E3';    

                    polygon.setOptions({
                        fillColor: dataColor
                    });    
                    
                            // 마우스 올렸을때, 컬러 세팅
                    kakao.maps.event.addListener(polygon, 'mouseover', function(mouseEvent) { 
                        
                        // customOverlay.setPosition(mouseEvent.latLng); 
                        // customOverlay.setMap(map);
                    });
                    kakao.maps.event.addListener(polygon, 'mousemove', function(mouseEvent) {
                        // customOverlay.setPosition(mouseEvent.latLng); 
                    });
                    
                    kakao.maps.event.addListener(polygon, 'mouseout', function() {
                        // polygon.setOptions({fillColor: '#fff'}); // 마우스 벗어났을때, 컬러 세팅
                        customOverlay.setMap(null);
                    }); 

                    kakao.maps.event.addListener(polygon, 'click', function(mouseEvent) {
                        // let oCurrencyFormat = NumberFormat.getCurrencyInstance({
                        //     currencyCode: false
                        // });
                        // let price = oMapModel.getProperty(`/${data.name}`),
                        //     priceFormat = oCurrencyFormat.format(price, "KRW"); // returns $1,234.57
                        var content = '<div class="wrap">' + 
                                    '    <div class="info">' + 
                                    '        <div class="title">' + 
                                    `           ${data.name}` + 
                                    '            <div class="close" onclick="closeOverlay()" title="닫기"></div>' + 
                                    '        </div>' + 
                                    '        <div class="body">' + 
                                    '            <div class="desc">' + 
                                    `                <div class="ellipsis">총 가격 : ${price.toLocaleString()}</div>` +
                                    '            </div>' + 
                                    '        </div>' + 
                                    '    </div>' +    
                                    '</div>';
                        customOverlay.setContent(content); 
                        customOverlay.setPosition(mouseEvent.latLng); 
                        customOverlay.setMap(map);
                    });
                    
                    polygon.setMap(map);
                }
                
                if("Polygon" == geometry.type){
                    

                    var coordinate = geometry.coordinates[0];
                    var polygonArr = {"name":Feature.properties[_that._name], "path":[]}
                    
                    for(var c in coordinate){						
                        polygonArr.path.push(new kakao.maps.LatLng(coordinate[c][1], coordinate[c][0]));
                    }
                    
                    setPolygon(polygonArr)
                }else if("MultiPolygon" == geometry.type){
                    for(var c in geometry.coordinates){
                        
                        var multiCoordinates = geometry.coordinates[c];
                        
                        polygonArr = {
                            "name": Feature.properties[_that._name],
                            "path": []
                        };
                        
                        for(var z in multiCoordinates[0]){
                            polygonArr.path.push(
                                new kakao.maps.LatLng(multiCoordinates[0][z][1], multiCoordinates[0][z][0])
                            );
                        }

                        setPolygon(polygonArr)
                    }
                    
                }
            },
            _getDarwingOption: function(oArea, aOptions) {
                var color = '#004c80';
                var iTotal = 0;
                var num = 0;
                aOptions.forEach(function(option){
                    if(
                        oArea.properties.SIG_KOR_NM === option.address || 
                        oArea.properties.SIG_KOR_NM.includes(option.address)
                    ){
                        num++;
                        iTotal += option.total;
                    }
                });

                if(num > 0 && num < 5) { color = 'red' }
                else if(num >= 5 && num < 10) { color = 'blue' }

                return {
                    color: color,
                    total: iTotal,
                    data: aOptions
                }
            },
            // 매번 실행 되어야 함. 현재는 1번만 실행 됨.
            initMap : function() {
                kakao.maps.load(function() {
                    const ps = new kakao.maps.services.Places();
                    ps.keywordSearch("카카오", (data) => {
                      console.log(data);
                    });
                    
                    var mapDomId = this.getView().byId("map").getId();
                    var container = document.getElementById(mapDomId); //지도를 담을 영역의 DOM 레퍼런스
                    var options = { //지도를 생성할 때 필요한 기본 옵션,
                        // center: new kakao.maps.LatLng(35.87322622210649, 127.070226716412), // 지도의 중심좌표
                        center: new kakao.maps.LatLng(37.57477,126.96340), //37.57477,126.96340
                        level: 10 //지도의 레벨(확대, 축소 정도)37.57414,126.95602
                    };
                    ////////여기 부분부터 매번 실행 되어야 함.
                    // v3가 모두 로드된 후, 이 콜백 함수가 실행됩니다.
                    var map = new kakao.maps.Map(container, options),
                        customOverlay = new kakao.maps.CustomOverlay({}),
                        infowindow = new kakao.maps.InfoWindow({removable: true});

                    /**
                     * --------- 행정구역 시군구 데이터를 기준을 갑고 Ploygon을 그린다.
                     */
                    var oFeatures = this.getView().getModel('kakaoMap').getProperty('/geoMap/features');
                    var areas = this._getArea(oFeatures);


                    // Data Setting
                    var testData = this._testData();

                    // 지도에 영역데이터를 폴리곤으로 표시합니다 
                    for (var i = 0, len = areas.length; i < len; i++) {
                        // debugger;
                        var drawingOptions = this._getDarwingOption(areas[i], testData)
                        this._getPoloycode(areas[i], map, drawingOptions, customOverlay, infowindow);
                    }
                    ///// 매번 실행 되어야 함. (조회 할때마다. 버튼 누를때 마다.)
                }.bind(this));
            },

            /**
             * 버튼 Press 이벤트
             * 사용자가 해당 이벤트를 발생시키면 이전페이지로 갈수 있도록 한다.
             */
            onNavBackPress: function() {
                /**
                 * parameter - string
                 * 해당 페이지의 이전 페이지 routing name을 넣어준다.
                 */
                this.backPage("Main");
            }
        });
    });
