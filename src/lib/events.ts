export type EventName =
  | "copy_npm_command"
  | "copy_code_block"
  | "copy_block_code"
  | "copy_email"
  | "copy_phone_number"
  | "play_name_pronunciation"
  | "open_command_menu"
  | "command_menu_search"
  | "command_menu_action"
  | "blog_search"
  | "toc_inline_toggle"
  | "toc_inline_item_click"
  | "toc_minimap_hover"
  | "toc_minimap_item_click"
  | "keyboard_shortcut_navigate"
  | "block_viewer_tab_change"
  | "block_viewer_resize"
  | "block_viewer_open_preview"
  | "block_viewer_refresh_preview"
  | "block_viewer_theme_change"
  | "doc_sponsors_close"

export type EventPropertyValue = string | number | boolean | null

export type Event = {
  name: EventName
  properties?: Record<string, EventPropertyValue>
}

export function trackEvent(input: Event) {
  if (process.env.NODE_ENV !== "production") {
    console.log("trackEvent:", input)
  }
}
