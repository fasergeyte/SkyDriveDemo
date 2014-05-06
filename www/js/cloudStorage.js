window.CloudStorage = window.CloudStorage || function (_clientId, _redirectUri) {
    var ROOT_DIRECTORY = null,
        TOKEN_INVALID_CODE = null,
        DRIVE_NAME = null,
        accessToken,
        userInfoUrl ,
        filesUrlForDirectory,
        singOutUrl,
        clientId,
        signInUrl,
        redirectUri,
        http,
        q,
        searchUrl,
        nameSearch,
        signOutRedirectUrl,
        signOutEvent,

        processLoadedData,

        doLoad = function(url) {
            var deferred = q.defer(),
                result;
            http({
                    method: 'GET',
                    url: url
                }
            ).success(
                function (response) {
                    response = JSON.parse(response.substring(response.indexOf('JSONP(')+6, response.length - 2 ));
                    if(response.error) {
                        if(response.error.code = TOKEN_INVALID_CODE) {
                            accessToken = null;
                        }
                        deferred.reject(response.error);
                    } else {
                        result = processLoadedData(response);
                        deferred.resolve(result);
                    }
                }.bind(this)
            ).error(function (e) {
                    deferred.resolve([]);
                });
            return deferred.promise;
        },

        getAccessTokenFromURL = function(url) {
            url = url.substr(url.indexOf('access_token='));
            if (url.length === 0) {
                return null;
            }
            if (url.indexOf('&') !== -1) {
                return url.substr(0, url.indexOf('&'));
            } else {
                return url;
            }
        },

        generateURLs = function(){
            this.generateUrls();
        },

        createDirectoryForPath= function(path, fileSystem) {
            var dirArgs = path.split('/'),
                tmpPath = dirArgs[0],
                deferred = q.defer(),
                createDir = function(i) {
                    if (i < dirArgs.length) {
                        fileSystem.root.getDirectory(tmpPath , {create: true}, function(){
                            if (i < dirArgs.length - 2){
                                tmpPath += '/' + dirArgs[i + 1];
                                createDir(i + 1);
                            } else {
                                deferred.resolve();
                            }
                        });
                    }
                };
            createDir(0);
            return deferred.promise;
        };

    clientId = _clientId;
    redirectUri = _redirectUri;

        return {
            setup: function(storageName, rootDirectory, invalidAccessTokenErrorCode, signOutRedirectUrlValue, signOutEventValue, processLoadedDataValue) {
                this.setStorageName(storageName);
                this.setRootDirectory(rootDirectory);
                this.setInvalidTokenErrorCode(invalidAccessTokenErrorCode);
                this.setSignOutRedirectUrl(signOutRedirectUrlValue);
                signOutEvent = signOutEventValue;
                processLoadedData = processLoadedDataValue.bind(this);

                generateURLs = generateURLs.bind(this);
                generateURLs();
            },

            generateUrls: generateURLs,

            setUrls: function(userInfoUrlValue, filesUrlForDirectoryValue, signInUrlValue, signOutUrlValue, searchUrlValue) {
                userInfoUrl = userInfoUrlValue;
                filesUrlForDirectory = filesUrlForDirectoryValue;
                singOutUrl = signOutUrlValue;
                signInUrl = signInUrlValue;
                searchUrl = searchUrlValue;
            },

            setStorageName: function(value) {
                DRIVE_NAME = value;
            },

            getStorageName: function() {
                return DRIVE_NAME;
            },

            setInvalidTokenErrorCode: function(value) {
                TOKEN_INVALID_CODE = value;
            },

            getInvalidTokenErrorCode: function() {
                return TOKEN_INVALID_CODE;
            },

            setRootDirectory: function(value) {
                ROOT_DIRECTORY = value;
            },

            getRootDirectory: function() {
                return ROOT_DIRECTORY;
            },

            getSearchString: function() {
                return nameSearch;
            },

            setAccessToken: function(aToken) {
                accessToken = aToken;
                generateURLs();
            },

            getAccessToken: function() {
                return accessToken;
            },

            getUserInfoURL: function() {
                return userInfoUrl;
            },

            getClientId: function() {
                return clientId;
            },

            setClientId: function(cliId) {
                clientId = cliId;
                generateURLs();
            },

            getRedirectUri: function() {
                return redirectUri;
            },

            setRedirectUri: function(redUri) {
                redirectUri = redUri;
                generateURLs();
            },

            setSignOutRedirectUrl: function(value) {
                  signOutRedirectUrl = value;
            },

            signIn: function() {
                ProgressIndicator.hide();
                var deferred = q.defer();
                if (!accessToken) {
                    var inAppBrowser = window.open(signInUrl,'_blank', 'location=no');
                    ProgressIndicator.show(true);

                    inAppBrowser.addEventListener('loadstop',function(e) {
                        ProgressIndicator.hide();
                    });

                    inAppBrowser.addEventListener('loadstart', function (e) {
                        if (e.url.indexOf("access_token=") > 0) {
                            accessToken = getAccessTokenFromURL(e.url);
                            generateURLs();
                            deferred.resolve(accessToken);
                            inAppBrowser.close();
                        }
                    });

                    inAppBrowser.addEventListener('exit', function(e) {
                        deferred.reject(accessToken);
                    });
                } else {
                    deferred.resolve(accessToken);
                }
                return deferred.promise;
            },

            signOut: function() {
                var deferred = q.defer();
                var inAppBrowser = window.open(singOutUrl, '_blank', 'location=no');
                ProgressIndicator.show(true);
                inAppBrowser.addEventListener(signOutEvent, function(e) {
                    if (e.url.indexOf(signOutRedirectUrl) === 0) {
                        inAppBrowser.close();
                        deferred.resolve();
                    }
                });
                return deferred.promise;
            },

            initialize: function ($http, $q) {
                http = $http;
                q = $q;
            },

            loadFilesData : function(request) {
                var url = filesUrlForDirectory.replace("%folderID%", request||ROOT_DIRECTORY);

                return doLoad.call(this, url);
            },

            fileSearch: function (searName) {
                var deferred = q.defer();
                nameSearch = searName;
                generateURLs();

                if(!accessToken) {
                    deferred.resolve([]);
                } else {
                    doLoad.call(this, searchUrl).then(
                        function(searchResult) {
                            deferred.resolve(searchResult);
                        },
                        function(error) {
                            deferred.reject(error);
                        }
                    );
                }

                return deferred.promise;
            },

            loadUserInfo: function() {
                generateURLs();
                var deferred = q.defer();
                http({
                        method: 'GET',
                        url: userInfoUrl
                    }
                ).success(
                    function (userInfo) {
                        deferred.resolve(userInfo);
                    }
                );
                return deferred.promise;
            },

            downloadFile: function (uriString, fileName, onSuccess , onError, onProgress) {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                    createDirectoryForPath(fileName, fileSystem).then( function() {
                        fileSystem.root.getFile(fileName, { create: true }, function (targetFile){
                            var onSuccessThis = function(res){
                                    onSuccess(targetFile.toNativeURL());
                                },
                                downloader = new BackgroundTransfer.BackgroundDownloader(),
                            // Create a new download operation.
                                download = downloader.createDownload(uriString, targetFile);
                            // Start the download and persist the promise to be able to cancel the download.
                            download.startAsync().then(onSuccessThis, onError, onProgress);
                        });
                    });
                });
            }
        };
};