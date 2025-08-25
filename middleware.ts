import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"]; // add any others if needed

export function middleware(req: NextRequest) {

    const {pathname} = req.nextUrl;

    // allow public paths
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // check auth cookie (adjust name to your app)
    const token = req.cookies.get("token")?.value;

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname); // optional: remember where to go after login
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // protect everything except assets
};
