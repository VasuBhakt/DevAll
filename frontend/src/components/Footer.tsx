"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { isAuthPage } from "@/hooks";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const authPage = isAuthPage(pathname);
  return (
    !authPage && (
      <>
        <section className="relative overflow-hidden py-12 bg-background w-full border-t border-border/40">
          <div className="relative z-10 mx-auto max-w-7xl px-4">
            <div className="-m-6 flex flex-wrap justify-between">
              {/*Brand & Copyright*/}
              <div className="w-full p-6 lg:w-4/12">
                <div className="flex h-full flex-col justify-between">
                  <Link
                    href="/"
                    className="flex items-center font-bold text-xl tracking-tighter transition-transform hover:scale-101"
                  >
                    <Logo />
                  </Link>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                      &copy; {new Date().getFullYear()} DevAll. All Rights
                      Reserved.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap lg:w-4/12 justify-between">
                {/*Connect Section*/}
                <div className="w-1/2 p-6 sm:w-1/3 md:w-1/3 lg:w-auto">
                  <div className="h-full">
                    <h3 className="tracking-px mb-6 text-xs font-bold uppercase text-foreground/70">
                      Connect
                    </h3>
                    <ul className="flex flex-col gap-3">
                      <li>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/70 hover:text-foreground transition-colors duration-200"
                          href="#"
                        >
                          Github
                        </a>
                      </li>
                      <li>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/70 hover:text-foreground transition-colors duration-200"
                          href="#"
                        >
                          LinkedIn
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                {/*Project Section */}
                <div className="w-1/2 p-6 sm:w-1/3 md:w-1/3 lg:w-auto">
                  <div className="h-full">
                    <h3 className="tracking-px mb-6 text-xs font-bold uppercase text-foreground/70">
                      Project
                    </h3>
                    <ul className="flex flex-col gap-3">
                      <li>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/70 hover:text-foreground transition-colors duration-200"
                          href="#"
                        >
                          Source Code
                        </a>
                      </li>
                      <li>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/70 hover:text-foreground transition-colors duration-200"
                          href="#"
                        >
                          Documentation
                        </a>
                      </li>
                      <li>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/70 hover:text-foreground transition-colors duration-200"
                          href="#"
                        >
                          Report Bug
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  );
}
