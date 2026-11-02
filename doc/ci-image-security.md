# Firefox image security gate

The release workflow originally checked out mathjslab-app at
`a667d8a5aa63a5d065a72ba47af2237323a9b4b3` (1.21.0). Its image test rejected
all requestfailed events, even when the final policy-approved image decoded
successfully. The reported Linux failure was a CircleCI badge request with
NS_BINDING_ABORTED during the second Firefox repetition.

The workflow now pins the already-published app commit
`16da3bc020003e1a254e61e0504278631661abf6` (1.21.1), which contains the image
lifecycle regression correction. It does not follow the moving main branch or
use the sibling application's uncommitted development changes.

The corrected test requires all three final images to decode, complete and have
nonzero natural dimensions; their original URLs must remain intact. Each URL
must have a successful response, and all requests for those URLs must be image
requests rather than CORS fetches. The only tolerated failure is Firefox's
NS_BINDING_ABORTED for one of those same successfully loaded image URLs. Other
browsers, URLs, request types and failure codes remain failures. The separate
adversarial test still asserts that blocked cross-origin requests never occur.

## Focused validation — 2026-11-02

Extracted the test and lifecycle fixture directly from the pinned commit into
an ignored isolated directory. A local HTTP server exposes the built 0.10.0
browser distribution at the application's expected bundle URL and retains its
cross-origin redirect fixture. The sibling application checkout was read only.

The exact Firefox gate passed all six tests: one worker, no retries and three
repetitions. This local check used Windows Firefox; it does not substitute for
the workflow's Linux application build and browser run. The first restricted
browser launch crashed before opening pages; the normal unsandboxed browser run
completed successfully.

This change updates CI's application fixture only. No library runtime change,
version bump or new npm publication is required. Linux Actions remains the
integration check for the pinned app build and its full asset-copy path.

The same two security cases also passed in Chromium and WebKit (four tests),
with no retries. The workflow still runs its original strict six-test Firefox
gate; its only functional change is the immutable application checkout
revision.
