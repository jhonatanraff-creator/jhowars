import styles from "./internal-page-header.module.css";

export function InternalPageHeader({ label, title, intro }: { label?: string; title: string; intro?: string }) {
  return <header className={styles.header} data-internal-page-header>
    {label && <p className={styles.label}>{label}</p>}
    <h1 className={styles.title}>{title}</h1>
    {intro && <p className={styles.intro}>{intro}</p>}
  </header>;
}

