/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext
) {
  return isbot(request.headers.get("user-agent"))
    ? handleBot(request, status, headers, context)
    : handleBrowser(request, status, headers, context);
}

function handleBot(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={context}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          
          headers.set("Content-Type", "text/html");
          resolve(new Response(stream, { headers, status }));
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          status = 500;
          if (shellRendered) console.error(error);
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowser(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={context}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          
          headers.set("Content-Type", "text/html");
          resolve(new Response(stream, { headers, status }));
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          status = 500;
          if (shellRendered) console.error(error);
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
