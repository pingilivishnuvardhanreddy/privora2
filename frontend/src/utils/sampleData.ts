/**
 * Synthetic Sample Data Generators for PRIVORA
 * Strictly synthetic mock test values for demonstration and evaluation.
 * Contains all 6 PII categories, repeated identifiers, and invalid 16-digit order IDs to test Luhn rejection.
 */

export const SAMPLE_TXT_PAYLOAD = `PRIVORA ENTERPRISE INCIDENT AUDIT LOG (SYNTHETIC BENCHMARK)
================================================================================
Timestamp: 2026-11-27T10:14:22Z
Execution Context: 100% Client-Side In-Memory Diagnostic
System Origin Node: 192.168.1.145 (Internal Gateway IPv4)
Backup Proxy Host: 10.0.4.82

CUSTOMER PROFILE 1:
- Primary Contact: Rajesh Verma
- Registered Email: rajesh.verma@enterprise-corp.in
- Mobile Phone: +91 98765 43210
- Indian Income Tax PAN: ABCDE1234F
- Indian UIDAI Aadhaar: 4532 9876 1234
- Settlement Credit Card (Valid Luhn Visa): 4532-0150-1234-5674
- E-Commerce Transaction Ref (Invalid 16-digit Luhn - Non-PCI): 1234567890123456

CUSTOMER PROFILE 2 (REPEATED IDENTIFIER CHECK FOR PSEUDONYMIZATION):
- Alternate Contact: Priya Nair
- Secondary Approver: rajesh.verma@enterprise-corp.in
- Mobile Contact: +91 91234 56789
- Corporate PAN: XYZPK9821L
- UIDAI Aadhaar ID: 8921 4452 7701
- Corporate Master Payment (Valid Luhn Mastercard): 5425-2334-3010-9903
- Logistics Tracking Serial (Invalid 16-digit Luhn - Non-PCI): 9876543210987654
- External Webhook Destination IPv4: 172.16.254.1

ZERO-EGRESS INTEGRITY NOTE:
Notice how the 16-digit Order Ref '1234567890123456' and Tracking Serial '9876543210987654'
are safely rejected by the Luhn modulo-10 algorithm, avoiding false-positive alerts.
`;

export const SAMPLE_CSV_PAYLOAD = `id,full_name,email_address,mobile_phone,aadhaar_number,pan_number,credit_card,order_reference_16digit,server_ip
USR-101,Rajesh Verma,rajesh.verma@enterprise-corp.in,+91 98765 43210,4532 9876 1234,ABCDE1234F,4532-0150-1234-5674,1234567890123456,192.168.1.145
USR-102,Priya Nair,priya.nair@security-ops.org,+91 91234 56789,8921 4452 7701,XYZPK9821L,5425-2334-3010-9903,9876543210987654,10.0.4.82
USR-103,Amitabh Sen,amitabh.sen@apex-cloud.in,+91 99887 76655,7812 3456 9012,BNZPA4321K,4000-1234-5678-9010,8877665544332211,172.16.0.24
USR-104,Rajesh Verma,rajesh.verma@enterprise-corp.in,+91 98765 43210,4532 9876 1234,ABCDE1234F,4532-0150-1234-5674,1122334455667788,192.168.1.200
`;
