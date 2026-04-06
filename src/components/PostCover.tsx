import Image from "next/image";
import styles from "./PostCover.module.css";

interface PostCoverProps {
  src?: string;
  alt: string;
  caption?: string;
}

export default function PostCover({ src, alt, caption }: PostCoverProps) {
  if (!src) return null;
  return (
    <figure className={styles.figure}>
      <div className={styles.wrap}>
        <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes="620px" />
      </div>
      {caption && (
        <figcaption className={styles.caption}>{caption}</figcaption>
      )}
    </figure>
  );
}
