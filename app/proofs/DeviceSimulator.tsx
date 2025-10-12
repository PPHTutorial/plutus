/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';

interface DeviceSimulatorProps {
    selectedSkin: string;
}

export default function DeviceSimulator({ selectedSkin }: DeviceSimulatorProps) {
    const getDeviceConfig = (skinFile: string) => {
        // Map skin filenames to device configurations
        const skinToDeviceMap: { [key: string]: any } = {
            // iPhone devices
            'apple-iphone14-blue-portrait.png': {
                name: 'iPhone 14',
                screenWidth: 390,
                screenHeight: 844,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 47,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone14plus-blue-portrait.png': {
                name: 'iPhone 14 Plus',
                screenWidth: 428,
                screenHeight: 926,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 47,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone13-blue-portrait.png': {
                name: 'iPhone 13',
                screenWidth: 390,
                screenHeight: 844,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 47,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone13mini-blue-portrait.png': {
                name: 'iPhone 13 Mini',
                screenWidth: 375,
                screenHeight: 812,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 50,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone13pro-gold-portrait.png': {
                name: 'iPhone 13 Pro',
                screenWidth: 390,
                screenHeight: 844,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 47,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone13promax-gold-portrait.png': {
                name: 'iPhone 13 Pro Max',
                screenWidth: 428,
                screenHeight: 926,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 47,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone-11-black-portrait.png': {
                name: 'iPhone 11',
                screenWidth: 414,
                screenHeight: 896,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 44,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone-11-pro-gold-portrait.png': {
                name: 'iPhone 11 Pro',
                screenWidth: 375,
                screenHeight: 812,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 44,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone-11-pro-max-gold-portrait.png': {
                name: 'iPhone 11 Pro Max',
                screenWidth: 414,
                screenHeight: 896,
                hasStatusBar: true,
                hasHomeIndicator: true,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 44,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone-15-black-portrait.png': {
                name: 'iPhone 15',
                screenWidth: 393,
                screenHeight: 852,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: true,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 54,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone-15-plus-black-portrait.png': {
                name: 'iPhone 15 Plus',
                screenWidth: 430,
                screenHeight: 932,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: true,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 54,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone-15-pro-black-titanium-portrait.png': {
                name: 'iPhone 15 Pro',
                screenWidth: 393,
                screenHeight: 852,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: true,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 54,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone-15-pro-max-black-titanium-portrait.png': {
                name: 'iPhone 15 Pro Max',
                screenWidth: 430,
                screenHeight: 932,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: true,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 54,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone14pro-deeppurple-portrait.png': {
                name: 'iPhone 14 Pro',
                screenWidth: 393,
                screenHeight: 852,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: true,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 54,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            'apple-iphone14promax-deeppurple-portrait.png': {
                name: 'iPhone 14 Pro Max',
                screenWidth: 430,
                screenHeight: 932,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: true,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 54,
                bottomBarHeight: 34,
                navigationBarHeight: 0,
            },
            // iPad devices
            'apple-ipadpro11-spacegrey-portrait.png': {
                name: 'iPad Pro 11"',
                screenWidth: 834,
                screenHeight: 1194,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 24,
                bottomBarHeight: 20,
                navigationBarHeight: 0,
            },
            'apple-ipadair5-spacegrey-portrait.png': {
                name: 'iPad Air 5',
                screenWidth: 820,
                screenHeight: 1180,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 24,
                bottomBarHeight: 20,
                navigationBarHeight: 0,
            },
            'apple-ipadmini-starlight-portrait.png': {
                name: 'iPad Mini',
                screenWidth: 744,
                screenHeight: 1133,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: false,
                platform: 'ios',
                statusBarHeight: 24,
                bottomBarHeight: 20,
                navigationBarHeight: 0,
            },
            // Samsung devices
            'samsung-galaxys21-black-portrait.png': {
                name: 'Samsung Galaxy S21',
                screenWidth: 360,
                screenHeight: 780,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'samsung-galaxys21plus-black-portrait.png': {
                name: 'Samsung Galaxy S21+',
                screenWidth: 384,
                screenHeight: 854,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'samsung-galaxys21ultra-black-portrait.png': {
                name: 'Samsung Galaxy S21 Ultra',
                screenWidth: 412,
                screenHeight: 915,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'samsung-galaxy-s24-ultra-portrait.png': {
                name: 'Samsung Galaxy S24 Ultra',
                screenWidth: 412,
                screenHeight: 915,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'samsung-galaxys20-cloudblue-portrait.png': {
                name: 'Samsung Galaxy S20',
                screenWidth: 360,
                screenHeight: 780,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'samsung-galaxys20plus-cloudblue-portrait.png': {
                name: 'Samsung Galaxy S20+',
                screenWidth: 384,
                screenHeight: 854,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'samsung-galaxys20ultra-cosmicblack-portrait.png': {
                name: 'Samsung Galaxy S20 Ultra',
                screenWidth: 412,
                screenHeight: 915,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'samsung-galaxys4-black-portrait.png': {
                name: 'Samsung Galaxy S4',
                screenWidth: 360,
                screenHeight: 640,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 25,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            // Google Pixel devices
            'google-pixel-7-obsidian-portrait.png': {
                name: 'Google Pixel 7',
                screenWidth: 412,
                screenHeight: 915,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'google-pixel-8-rose-portrait.png': {
                name: 'Google Pixel 8',
                screenWidth: 412,
                screenHeight: 915,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'google-pixel4-clearlywhite-portrait.png': {
                name: 'Google Pixel 4',
                screenWidth: 393,
                screenHeight: 830,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 27,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'google-pixel4xl-clearlywhite-portrait.png': {
                name: 'Google Pixel 4 XL',
                screenWidth: 412,
                screenHeight: 869,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: true,
                hasDynamicIsland: false,
                hasPunchHole: false,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 27,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'google-pixel5-justblack-portrait.png': {
                name: 'Google Pixel 5',
                screenWidth: 393,
                screenHeight: 851,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 27,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            // Other Android devices
            'oneplus-oneplus8pro-portrait.png': {
                name: 'OnePlus 8 Pro',
                screenWidth: 412,
                screenHeight: 915,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
            'huawei-p-40-pro-plus-portrait.png': {
                name: 'Huawei P40 Pro Plus',
                screenWidth: 440,
                screenHeight: 1208,
                hasStatusBar: true,
                hasHomeIndicator: false,
                hasNotch: false,
                hasDynamicIsland: false,
                hasPunchHole: true,
                hasNavigationBar: true,
                platform: 'android',
                statusBarHeight: 36,
                bottomBarHeight: 0,
                navigationBarHeight: 48,
            },
        };

        return skinToDeviceMap[skinFile] || {
            name: 'Unknown Device',
            screenWidth: 390,
            screenHeight: 844,
            hasStatusBar: true,
            hasHomeIndicator: true,
            hasNotch: false,
            hasDynamicIsland: false,
            hasPunchHole: false,
            hasNavigationBar: false,
            platform: 'unknown',
            statusBarHeight: 47,
            bottomBarHeight: 34,
            navigationBarHeight: 0,
        };
    };

    const config = getDeviceConfig(selectedSkin);

    const StatusBar = ({ platform }: { platform: string }) => {
        if (platform === 'ios') {
            return (
                <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-20 flex items-center justify-between px-6 py-1 text-white text-xs z-10">
                    <div className="flex items-center gap-1">
                        <span className="font-medium">9:41</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-3 bg-white rounded-sm opacity-80"></div>
                        <div className="w-4 h-3 bg-white rounded-sm opacity-60"></div>
                        <div className="w-6 h-3 bg-white rounded-sm opacity-40"></div>
                        <span className="ml-1">100%</span>
                        <div className="w-4 h-4 bg-white rounded-full opacity-60"></div>
                    </div>
                </div>
            );
        }

        if (platform === 'android') {
            return (
                <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-10 flex items-center justify-between px-4 py-1 text-white text-xs z-10">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">9:41</span>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-3 bg-white rounded-sm opacity-60"></div>
                        <div className="w-4 h-3 bg-white rounded-sm opacity-40"></div>
                        <div className="w-6 h-3 bg-white rounded-sm opacity-20"></div>
                        <span className="ml-1">100%</span>
                        <div className="w-4 h-4 bg-white rounded-full opacity-60"></div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const BottomBar = ({ platform }: { platform: string }) => {
        if (platform === 'ios') {
            return (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-10 flex items-center justify-center py-1 z-10">
                    <div className="w-32 h-1 bg-white rounded-full opacity-60"></div>
                </div>
            );
        }

        if (platform === 'android') {
            return (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-10 flex items-center justify-around py-1 px-4 z-10">
                    <div className="flex flex-col items-center text-white text-xs">
                        <div className="w-6 h-6 bg-white rounded opacity-80 mb-1"></div>
                        <span className="text-xs opacity-80">Home</span>
                    </div>
                    <div className="flex flex-col items-center text-white text-xs">
                        <div className="w-6 h-6 bg-white rounded opacity-60 mb-1"></div>
                        <span className="text-xs opacity-60">Back</span>
                    </div>
                    <div className="flex flex-col items-center text-white text-xs">
                        <div className="w-6 h-6 bg-white rounded opacity-60 mb-1"></div>
                        <span className="text-xs opacity-60">Recent</span>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-slate-900 mb-4">{config.name}</h3>

            {/* Device Container with Border Effect */}

            <div className="relative flex flex-col bg-slate-100 overflow-hidden" style={{ width: config.screenWidth, height: config.screenHeight }}>
                <img src={`mockups/${selectedSkin}`} alt="" className='absolute inset-0 w-full h-full object-cover' style={{ width: config.screenWidth, height: config.screenHeight }} />
                <p className='text-red-500 p-4 text-sm'>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos earum vitae ratione sunt corrupti explicabo molestias, autem est nostrum dolorem sed eaque.
                    Eligendi veritatis rerum enim eius aperiam vitae impedit. Quisquam vel qui reprehenderit libero laudantium quia? Odit eligendi totam minima asperiores soluta,
                    dolorem, dolores, numquam neque similique exercitationem cum obcaecati vitae. Dolorum molestias consectetur laudantium placeat dignissimos vero ratione tempora,
                    eligendi odit ipsa suscipit similique sit aliquid distinctio obcaecati. Quidem, atque non? Dolore totam assumenda deleniti amet alias iusto,
                    fugit dicta incidunt velit nihil magnam placeat hic reprehenderit architecto consequatur a! Reiciendis obcaecati sit rerum, ipsam repudiandae veniam ipsa.


                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos earum vitae ratione sunt corrupti explicabo molestias, autem est nostrum dolorem sed eaque.
                    Eligendi veritatis rerum enim eius aperiam vitae impedit. Quisquam vel qui reprehenderit libero laudantium quia? Odit eligendi totam minima asperiores soluta,
                    dolorem, dolores, numquam neque similique exercitationem cum obcaecati vitae. Dolorum molestias consectetur laudantium placeat dignissimos vero ratione tempora,
                    eligendi odit ipsa suscipit similique sit aliquid distinctio obcaecati. Quidem, atque non? Dolore totam assumenda deleniti amet alias iusto,
                    fugit dicta incidunt velit nihil magnam placeat hic reprehenderit architecto consequatur a! Reiciendis obcaecati sit rerum, ipsam repudiandae veniam ipsa.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos earum vitae ratione sunt corrupti explicabo molestias, autem est nostrum dolorem sed eaque.
                    Eligendi veritatis rerum enim eius aperiam vitae impedit. Quisquam vel qui reprehenderit libero laudantium quia? Odit eligendi totam minima asperiores soluta,
                    dolorem, dolores, numquam neque similique exercitationem cum obcaecati vitae. Dolorum molestias consectetur laudantium placeat dignissimos vero ratione tempora,
                    eligendi odit ipsa suscipit similique sit aliquid distinctio obcaecati. Quidem, atque non? Dolore totam assumenda deleniti amet alias iusto,
                    fugit dicta incidunt velit nihil magnam placeat hic reprehenderit architecto consequatur a! Reiciendis obcaecati sit rerum, ipsam repudiandae veniam ipsa.


                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos earum vitae ratione sunt corrupti explicabo molestias, autem est nostrum dolorem sed eaque.
                    Eligendi veritatis rerum enim eius aperiam vitae impedit. Quisquam vel qui reprehenderit libero laudantium quia? Odit eligendi totam minima asperiores soluta,
                    dolorem, dolores, numquam neque similique exercitationem cum obcaecati vitae. Dolorum molestias consectetur laudantium placeat dignissimos vero ratione tempora,
                    eligendi odit ipsa suscipit similique sit aliquid distinctio obcaecati. Quidem, atque non? Dolore totam assumenda deleniti amet alias iusto,
                    fugit dicta incidunt velit nihil magnam placeat hic reprehenderit architecto consequatur a! Reiciendis obcaecati sit rerum, ipsam repudiandae veniam ipsa.
                </p>
            </div>

            <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                    {config.screenWidth} × {config.screenHeight} pixels
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    {config.platform === 'ios' ? 'iOS' : 'Android'} • {config.hasStatusBar ? 'Status Bar' : 'No Status Bar'} • {config.hasNavigationBar || config.hasHomeIndicator ? 'Navigation' : 'No Navigation'}
                </p>
            </div>
        </div>
    );
}