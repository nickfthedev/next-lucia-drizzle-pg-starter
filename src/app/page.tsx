import Image from "next/image";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

export default function Home() {
  return (
    <main className="flex-grow">
      Hello World
      <button className="btn btn-primary">Button</button>
    </main>
  );
}
