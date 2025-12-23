import { useState } from 'react'
import { SelectedAsset } from '@/components/AssetPickerModal'

export type AssetPickerTarget = {
  fieldKey: string
  arrayKey?: string
  arrayIndex?: number
}

type AssetSource = 'user' | 'system'
type AssetPickerMode = 'single' | 'multiple'

interface UseAssetPickerOptions {
  onFieldChange: (key: string, value: any) => void
  onArrayFieldChange: (arrayKey: string, index: number, fieldKey: string, value: any) => void
}

const normalizeAssetUrl = (url?: string) => {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  const uploadsIndex = trimmed.indexOf('/uploads/')
  if (uploadsIndex >= 0) {
    return trimmed.slice(uploadsIndex)
  }

  const systemIndex = trimmed.indexOf('/system-default/')
  if (systemIndex >= 0) {
    return trimmed.slice(systemIndex)
  }

  return trimmed
}

const normalizeSelectedAsset = (asset: SelectedAsset): SelectedAsset => {
  const normalizedUrl = normalizeAssetUrl(asset.url)
  return normalizedUrl ? { ...asset, url: normalizedUrl } : asset
}

const useAssetPicker = ({
  onFieldChange,
  onArrayFieldChange
}: UseAssetPickerOptions) => {
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false)
  const [assetPickerTarget, setAssetPickerTarget] = useState<AssetPickerTarget | null>(null)
  const [assetPickerSource, setAssetPickerSource] = useState<AssetSource>('user')
  const [assetPickerMode, setAssetPickerMode] = useState<AssetPickerMode>('single')
  const [multiSelectHandler, setMultiSelectHandler] = useState<((assets: SelectedAsset[]) => void) | null>(null)

  const openAssetPicker = (target: AssetPickerTarget, preferredSource: AssetSource = 'user') => {
    setAssetPickerMode('single')
    setMultiSelectHandler(null)
    setAssetPickerSource(preferredSource)
    setAssetPickerTarget(target)
    setIsAssetPickerOpen(true)
  }

  const openMultiAssetPicker = (handler: (assets: SelectedAsset[]) => void, preferredSource: AssetSource = 'user') => {
    setAssetPickerMode('multiple')
    setMultiSelectHandler(() => handler)
    setAssetPickerTarget(null)
    setAssetPickerSource(preferredSource)
    setIsAssetPickerOpen(true)
  }

  const closeAssetPicker = () => {
    setIsAssetPickerOpen(false)
    setAssetPickerTarget(null)
    setMultiSelectHandler(null)
    setAssetPickerMode('single')
  }

  const handleAssetSelect = (asset: SelectedAsset) => {
    if (!assetPickerTarget) return
    const normalized = normalizeSelectedAsset(asset)
    const value = normalized.url || asset.url

    if (assetPickerTarget.arrayKey !== undefined && assetPickerTarget.arrayIndex !== undefined) {
      onArrayFieldChange(assetPickerTarget.arrayKey, assetPickerTarget.arrayIndex, assetPickerTarget.fieldKey, value)
    } else {
      onFieldChange(assetPickerTarget.fieldKey, value)
    }

    closeAssetPicker()
  }

  const handleMultiAssetSelect = (assets: SelectedAsset[]) => {
    if (!assets?.length) {
      closeAssetPicker()
      return
    }

    if (multiSelectHandler) {
      multiSelectHandler(assets.map(normalizeSelectedAsset))
    }

    closeAssetPicker()
  }

  return {
    isAssetPickerOpen,
    assetPickerSource,
    assetPickerMode,
    openAssetPicker,
    openMultiAssetPicker,
    closeAssetPicker,
    handleAssetSelect,
    handleMultiAssetSelect
  }
}

export default useAssetPicker
