/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactNode } from "react"
import { DialogType } from "./types"

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface SystemInfo {
  system: {
    manufacturer: string
    model: string
    version: string
    serial: string
  }
  cpu: {
    manufacturer: string
    brand: string
    speed: number
    cores: number
    physicalCores: number
    processors: number
  }
  memory: {
    total: number
    free: number
    used: number
    active: number
  }
  os: {
    platform: string
    distro: string
    release: string
    kernel: string
    arch: string
    hostname: string
  }
  network: Array<{
    iface: string
    ip4: string
    ip6: string
    mac: string
  }>
  time: {
    current: number
    uptime: number
    timezone: string
    timezoneName: string
  }
}



export interface BlockchainData {
  balance: string
  totalReceived: string
  totalReceivedUSD: string
  totalSent: string
  totalSentUSD: string
  transactions: string
  firstSeen: string
  value?: string
  usd?: string
}

export interface FormValues {
  wallet: string
  sendTo: string
  address: string
  amount: string
  customizeFee: boolean
  transactionFee: string
  randomDelay: boolean
  minDelay: number
  maxDelay: number
  proxyType: string
  selectedProxy: string
  blockchainApi: string
  flashConfirmed: boolean
  receiveremail: string
  server: {}
  currency: string
}


export interface BlockchainAddressData {
  address: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  firstSeen?: string;
  lastSeen?: string;
}

export interface Transaction {
  hash: string;
  time: number;
  value: number;
  fee?: number;
}

export interface PriceData {
  symbol: string; name: string; icon: string; price: number; usdprice: any; change24h: any; volume24h: any; marketCap: any;
}


export interface ContentData {
  prices: PriceData[]
  setPrices: (data: PriceData[]) => void
  walletNetwork: string | null
  setWalletNetwork: (data: string | null) => void
  blockchainData: BlockchainData | null
  setBlockchainData: (data: BlockchainData | null) => void
  isLoading: boolean
  setIsLoading: (data: boolean) => void
  transactions: Transaction[]
  setTransactions: (data: Transaction[]) => void
  formValues: FormValues
  setFormValues: (data: FormValues) => void
  isOnline: boolean
  setIsOnline: (data: boolean) => void
  cfdata: any | any
  setCfdata: (data: any | any) => void
  logData: string[] | any[]
  setLogData: (data: string[] | any[]) => void
  dialogType: 'login' | 'register' | 'dialog'
  setDialogType: (data: 'login' | 'register' | 'dialog') => void
  multiTransactions: any[]
  setMultiTransactions: (data: any[]) => void
  state: DialogState
  setState: (data: DialogState) => void
  isFlashing: boolean
  setIsFlashing: (data: boolean) => void
  liveTransactions: any[]
  setLiveTransactions: (data: any[]) => void
  showTransactionPopup: boolean
  setShowTransactionPopup: (data: boolean) => void
  currentLiveTransaction: any
  setCurrentLiveTransaction: (data: any) => void
  showRandomTransaction: () => void
  hideTransactionPopup: () => void
}


export interface DialogState {
  isOpen: boolean
  type: DialogType
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
  progress?: number
  component?: ReactNode
  close?: () => void
  controls?: boolean
  okText?: string
  cancelText?: string
}