'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from 'react';
import DeviceSimulator from './DeviceSimulator';

export default function PageComponent() {
    const [selectedSkin, setSelectedSkin] = useState<string>('apple-iphone14-blue-portrait.png');
    const [availableSkins, setAvailableSkins] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Load available skins on component mount
    useEffect(() => {
        const skins = [
            'apple-iphone14-blue-portrait.png',
            'apple-iphone14plus-blue-portrait.png',
            'apple-iphone14pro-deeppurple-portrait.png',
            'apple-iphone14promax-deeppurple-portrait.png',
            'apple-iphone13-blue-portrait.png',
            'apple-iphone13mini-blue-portrait.png',
            'apple-iphone13pro-gold-portrait.png',
            'apple-iphone13promax-gold-portrait.png',
            'apple-iphone-15-black-portrait.png',
            'apple-iphone-15-plus-black-portrait.png',
            'apple-iphone-15-pro-black-titanium-portrait.png',
            'apple-iphone-15-pro-max-black-titanium-portrait.png',
            'apple-iphone-11-black-portrait.png',
            'apple-iphone-11-pro-gold-portrait.png',
            'apple-iphone-11-pro-max-gold-portrait.png',
            'apple-ipadpro11-spacegrey-portrait.png',
            'apple-ipadair5-spacegrey-portrait.png',
            'apple-ipadmini-starlight-portrait.png',
            'samsung-galaxys21-black-portrait.png',
            'samsung-galaxys21plus-black-portrait.png',
            'samsung-galaxys21ultra-black-portrait.png',
            'samsung-galaxy-s24-ultra-portrait.png',
            'samsung-galaxys20-cloudblue-portrait.png',
            'samsung-galaxys20plus-cloudblue-portrait.png',
            'samsung-galaxys20ultra-cosmicblack-portrait.png',
            'samsung-galaxys4-black-portrait.png',
            'google-pixel-7-obsidian-portrait.png',
            'google-pixel-8-rose-portrait.png',
            'google-pixel4-clearlywhite-portrait.png',
            'google-pixel4xl-clearlywhite-portrait.png',
            'google-pixel5-justblack-portrait.png',
            'oneplus-oneplus8pro-portrait.png',
            'huawei-p-40-pro-plus-portrait.png',
        ];
        setAvailableSkins(skins);
    }, []);

    const getSkinDisplayName = (skinFile: string) => {
        return skinFile.replace('.png', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getSkinCategory = (skinFile: string) => {
        if (skinFile.includes('apple-iphone') || skinFile.includes('apple-ipad')) return 'iOS';
        if (skinFile.includes('samsung') || skinFile.includes('google-pixel') || skinFile.includes('oneplus') || skinFile.includes('huawei')) return 'Android';
        return 'Other';
    };

    const getFilteredSkins = () => {
        if (selectedCategory === 'All') return availableSkins;
        return availableSkins.filter(skin => getSkinCategory(skin) === selectedCategory);
    };

    const categories = ['All', 'iOS', 'Android'];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Device Skin Selector</h1>
                    <p className="text-slate-600">Select a device skin and work with its exact real-world dimensions</p>
                </div>

                {/* Category Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Categories</h2>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skin Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Available Device Skins</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {getFilteredSkins().map(skin => (
                            <button
                                key={skin}
                                onClick={() => setSelectedSkin(skin)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedSkin === skin
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <img
                                    src={`/mockups/${skin}`}
                                    alt={getSkinDisplayName(skin)}
                                    className="w-full h-20 object-contain mb-2"
                                />
                                <div className="text-xs font-medium text-slate-900 text-center">
                                    {getSkinDisplayName(skin)}
                                </div>
                                <div className="text-xs text-slate-500 text-center">
                                    {getSkinCategory(skin)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Current Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Current Selection</h2>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <img
                            src={`/mockups/${selectedSkin}`}
                            alt={getSkinDisplayName(selectedSkin)}
                            className="w-16 h-16 object-contain"
                        />
                        <div>
                            <p className="font-medium text-slate-900">Selected Skin: {getSkinDisplayName(selectedSkin)}</p>
                            <p className="text-sm text-slate-500">Category: {getSkinCategory(selectedSkin)}</p>
                        </div>
                    </div>
                </div>

                {/* Device Preview */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Device Preview</h2>
                    <div className="flex justify-center">
                        <DeviceSimulator selectedSkin={selectedSkin} />
                    </div>
                </div>
            </div>
        </div>
    );
}