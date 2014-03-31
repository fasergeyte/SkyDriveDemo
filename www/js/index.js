/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        document.addEventListener("backbutton", function () { navigator.app.exitApp() }, true);
        var ref = window.open("https://login.live.com/oauth20_authorize.srf?client_id=0000000048113444&display=touch&locale=en&response_type=token&scope=wl.skydrive&state=redirect_type=auth&display=touch&request_ts={0}&redirect_uri=x-wmapp0%253Awww%252Findex.html&response_method=url&secure_cookie=false&redirect_uri=http://SkyDriveSuperDemo.com/skyDrive/index.html", '_blank', 'location=no');
        ref.addEventListener('loadstart', function (e) {
            console.log('start: ' + JSON.stringify(e));
            if (e.url.indexOf("access_token=") > 0) {
                location.href = "indexOld.html" + (e.url.substr(e.url.indexOf("#")).split("&")[0]);
                ref.close();
            }
        });
        return;
    }
};
