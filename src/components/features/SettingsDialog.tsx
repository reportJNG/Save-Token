import type { ReactNode } from 'react'
import { Settings2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettingsStore, type FontFamily } from '@/stores/settingsStore'
import type { ResolutionMode } from '@/core/layout/resolution'
import type { ImageFormat } from '@/lib/canvas/exportImage'

const FONT_FAMILIES: FontFamily[] = ['JetBrains Mono', 'Roboto Mono', 'Consolas', 'Fira Code']

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function SettingsDialog() {
  const settings = useSettingsStore()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Generator settings</DialogTitle>
          <DialogDescription>Every value is a mathematical input — nothing here is guessed.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="layout">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Character width (px)">
                <Input
                  type="number"
                  min={1}
                  value={settings.cellWidth}
                  onChange={(e) => settings.setCellSize(Number(e.target.value), settings.cellHeight)}
                />
              </Field>
              <Field label="Character height (px)">
                <Input
                  type="number"
                  min={1}
                  value={settings.cellHeight}
                  onChange={(e) => settings.setCellSize(settings.cellWidth, Number(e.target.value))}
                />
              </Field>
            </div>

            <Field label="Resolution mode">
              <Select value={settings.mode} onValueChange={(v) => settings.setMode(v as ResolutionMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact (zero unused cells)</SelectItem>
                  <SelectItem value="compact">Compact (near-square, no lost characters)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Max page width (px)">
                <Input
                  type="number"
                  min={128}
                  value={settings.maxPageWidth}
                  onChange={(e) => settings.setMaxPageSize(Number(e.target.value), settings.maxPageHeight)}
                />
              </Field>
              <Field label="Max page height (px)">
                <Input
                  type="number"
                  min={128}
                  value={settings.maxPageHeight}
                  onChange={(e) => settings.setMaxPageSize(settings.maxPageWidth, Number(e.target.value))}
                />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 pt-2">
            <Field label="Font family">
              <Select value={settings.fontFamily} onValueChange={(v) => settings.setFontFamily(v as FontFamily)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Text color">
                <Input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => settings.setTextColor(e.target.value)}
                  className="h-9 w-full p-1"
                />
              </Field>
              <Field label="Background color">
                <Input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => settings.setBackgroundColor(e.target.value)}
                  disabled={settings.transparentBackground}
                  className="h-9 w-full p-1"
                />
              </Field>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="transparent-bg">Transparent background</Label>
              <Switch
                id="transparent-bg"
                checked={settings.transparentBackground}
                onCheckedChange={settings.setTransparentBackground}
              />
            </div>

            <Separator />

            <Field label={`Padding: ${settings.padding}px`}>
              <Slider min={0} max={96} step={4} value={[settings.padding]} onValueChange={([v]) => settings.setPadding(v)} />
            </Field>
            <Field label={`Margin: ${settings.margin}px`}>
              <Slider min={0} max={64} step={2} value={[settings.margin]} onValueChange={([v]) => settings.setMargin(v)} />
            </Field>
            <Field label={`Corner radius: ${settings.cornerRadius}px`}>
              <Slider
                min={0}
                max={48}
                step={2}
                value={[settings.cornerRadius]}
                onValueChange={([v]) => settings.setCornerRadius(v)}
              />
            </Field>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 pt-2">
            <Field label="Image format">
              <Select value={settings.imageFormat} onValueChange={(v) => settings.setImageFormat(v as ImageFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (lossless)</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="webp">WEBP</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={`Quality: ${Math.round(settings.quality * 100)}%`}>
              <Slider
                min={0.1}
                max={1}
                step={0.01}
                value={[settings.quality]}
                onValueChange={([v]) => settings.setQuality(v)}
                disabled={settings.imageFormat === 'png'}
              />
            </Field>

            <Button variant="ghost" size="sm" onClick={settings.resetToDefaults}>
              Reset to defaults
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
