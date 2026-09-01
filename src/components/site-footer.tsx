import { FooterWordmark } from "./footer-wordmark"
import styles from "./site-footer.module.css"

export function SiteFooter() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <FooterWordmark />
    </footer>
  )
}
