# Client Preview physical-device QA

Status: **PASS for the specific Client Preview scope and devices/browsers listed below.** Results were supplied by Founder on 29 September 2026. This records the actual checks reported; device model, OS/browser version numbers and exact deployment revision were not included in the report.

## Founder-reported physical results

| Device / browser | Check | Result |
|---|---|---|
| Android / Chrome | Landing page | PASS |
| Android / Chrome | Customer flow | PASS |
| Android / Chrome | Responsive layout | PASS |
| Android / Chrome | Voucher and QR display | PASS |
| Android / Chrome | Touch interaction | PASS |
| Android / Chrome | Unexpected error | NONE |
| iPhone / Safari | Landing page | PASS |
| iPhone / Safari | Customer flow | PASS |
| iPhone / Safari | Responsive layout | PASS |
| iPhone / Safari | Voucher and QR display | PASS |
| iPhone / Safari | Touch interaction | PASS |
| iPhone / Safari | Form and keyboard behavior | PASS |
| iPhone / Safari | Unexpected horizontal overflow | NONE |
| iPhone / Safari | Unexpected error | NONE |
| Windows laptop / Chrome | Landing page, customer flow, responsive/desktop layout | PASS |
| Windows laptop / Chrome | Voucher/QR display, navigation, refresh/persistence | PASS |
| Windows laptop / Chrome | Unexpected error | NONE |
| Windows laptop / Edge | Landing page, customer flow, responsive/desktop layout | PASS |
| Windows laptop / Edge | Voucher/QR display, navigation, refresh/persistence | PASS |
| Windows laptop / Edge | Unexpected error | NONE |
| Physical QR camera (device/browser not specified) | QR rendered and detected; payload decoded | PASS |
| Physical QR camera (device/browser not specified) | Payload is a synthetic voucher; no payment/account URL exposed | PASS |

The physical QR-camera result is not attributed to Android or iPhone because the camera device was not specified. The results establish compatibility only for the reported Android/Chrome, iPhone/Safari, Windows/Chrome and Windows/Edge checks. They do not establish support for other models, OS/browser versions, network environments, or router hardware.

## Scope not established by this report

The report does not separately claim physical-device voucher login/session expiry behavior, Signal Run gameplay, or Owner/Admin/Partner dashboard workflows. Real captive networking, SSID/device detection, MikroTik/RADIUS, payments, WhatsApp, telemetry and production voucher inventory remain simulated or unavailable. No production router or payment system is involved in this checklist.

The physical-device gate is **PASS for the tested Client Preview presentation scope**. Keep any unreported behavior marked unverified; do not extend this result to production or broader hardware/network compatibility.
