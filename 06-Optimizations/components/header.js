import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.png";
export default function Header() {
  return (
    <header id="main-header">
      <Link href="/">
        <Image src={logo} alt="Mobile phone with posts feed on it" priority />
      </Link>
      <nav>
        <ul>
          <li>
            <Link href="/feed">Feed</Link>
          </li>
          <li>
            <Link className="cta-link" href="/new-post">
              New Post
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
