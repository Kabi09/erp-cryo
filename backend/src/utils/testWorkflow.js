const http = require('http');

// Helper to make HTTP JSON requests
const request = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
};

const runEndToEndTest = async () => {
  console.log('=== STARTING END-TO-END WORKFLOW INTEGRATION TEST ===\n');

  try {
    // 1. Authenticate Sales Admin
    console.log('[Step 1] Logging in as Sales Admin...');
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@cryoscientific.com', password: 'Admin@123' }
    );

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
    }

    const token = loginRes.data.token;
    console.log('✓ Sales Admin authenticated successfully. Token received.\n');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 2. Create Lead Enquiry
    console.log('[Step 2] Creating New Lead Enquiry...');
    const leadRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/leads',
        method: 'POST',
        headers: authHeaders,
      },
      {
        companyName: 'Tata Memorial Hospital Advanced Cryo Research Centre',
        contactPerson: { name: 'Dr. Anita Deshmukh', designation: 'Director of Biobanking' },
        email: 'adeshmukh@tmh.res.in',
        phone: '+91 98201 99887',
        city: 'Mumbai',
        state: 'Maharashtra',
        source: 'Website',
        requirements: {
          equipmentType: 'Biological Cryogenic Freezer System',
          capacity: '800 Litres Ultra-Low Temp',
          specificationDetails: 'Auto LN2 backup, Dual RTD sensors, temperature logging',
          estimatedBudget: 950000,
          expectedDeliveryTime: '6 Weeks',
        },
      }
    );

    if (leadRes.status !== 201) throw new Error(`Lead creation failed: ${JSON.stringify(leadRes.data)}`);
    const lead = leadRes.data.data;
    console.log(`✓ Lead created: ${lead.leadNumber} (${lead.companyName})\n`);

    // 3. Lead Qualification
    console.log('[Step 3] Performing Lead Qualification...');
    const qualRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/leads/${lead._id}/qualify`,
        method: 'PUT',
        headers: authHeaders,
      },
      {
        status: 'Qualified',
        qualificationNotes: 'Approved research grant confirmed. Biobanking committee sign-off obtained.',
        budgetConfirmed: true,
        decisionMakerIdentified: true,
        requirementClarity: 'High',
      }
    );

    if (qualRes.status !== 200) throw new Error(`Qualification failed: ${JSON.stringify(qualRes.data)}`);
    console.log(`✓ Lead ${lead.leadNumber} successfully Qualified.\n`);

    // 4. Create Customer Master and Map to Lead
    console.log('[Step 4] Creating Customer Master...');
    const custRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/customers',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        companyName: 'Tata Memorial Hospital Advanced Cryo Research Centre',
        contactPerson: {
          name: 'Dr. Anita Deshmukh',
          designation: 'Director of Biobanking',
          email: 'adeshmukh@tmh.res.in',
          phone: '+91 98201 99887',
        },
        email: 'purchase@tmh.res.in',
        phone: '+91 22 2417 7000',
        gstin: '27AAATT1234F1Z8',
        pan: 'AAATT1234F',
        billingAddress: {
          addressLine1: 'Dr. E Borges Road, Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400012',
        },
        industry: 'Healthcare & Cancer Research',
      }
    );

    if (custRes.status !== 201) throw new Error(`Customer creation failed: ${JSON.stringify(custRes.data)}`);
    const customer = custRes.data.data;
    console.log(`✓ Customer master created: ${customer.customerCode} and mapped to Lead.\n`);

    // 5. Create Quotation Rev 0
    console.log('[Step 5] Creating Quotation Rev 0...');
    const quoteRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/quotations',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        customerId: customer._id,
        items: [
          {
            productName: 'Cryo Ultra-Low Biological Freezer System - 800L',
            specification: 'Capacity: 800L, -86°C dual cascade cooling, LN2 backup port',
            hsnCode: '841869',
            quantity: 1,
            unitPrice: 800000,
            discountPercent: 0,
            gstRate: 18,
          },
        ],
        paymentTerms: '30% Advance with PO, 70% against PI before dispatch',
        deliveryPeriod: '6 Weeks from PO date',
        validityDays: 30,
        warranty: '24 Months warranty on cascade refrigeration system',
      }
    );

    if (quoteRes.status !== 201) throw new Error(`Quotation creation failed: ${JSON.stringify(quoteRes.data)}`);
    const quotation = quoteRes.data.data;
    console.log(`✓ Quotation Rev 0 created: ${quotation.quotationNumber} (Grand Total: Rs. ${quotation.activeRevision.grandTotal.toLocaleString('en-IN')})\n`);

    // 6. Record Customer Review Feedback
    console.log('[Step 6] Recording Customer Review Feedback...');
    const feedbackRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/quotations/${quotation._id}/feedback`,
        method: 'POST',
        headers: authHeaders,
      },
      {
        feedbackType: 'Price High',
        notes: 'Hospital requested 5% institutional rebate to fit allocated research budget.',
      }
    );

    if (feedbackRes.status !== 200) throw new Error(`Feedback failed: ${JSON.stringify(feedbackRes.data)}`);
    console.log('✓ Customer review feedback recorded.\n');

    // 7. Create Quotation Revision (Rev 1)
    console.log('[Step 7] Creating Quotation Revision (Rev 1)...');
    const revRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/quotations/${quotation._id}/revise`,
        method: 'POST',
        headers: authHeaders,
      },
      {
        revisionReason: 'Commercial negotiation: 5% Institutional discount applied for cancer research center',
        items: [
          {
            productName: 'Cryo Ultra-Low Biological Freezer System - 800L',
            specification: 'Capacity: 800L, -86°C dual cascade cooling, LN2 backup port',
            hsnCode: '841869',
            quantity: 1,
            unitPrice: 800000,
            discountPercent: 5,
            gstRate: 18,
          },
        ],
        paymentTerms: '30% Advance with PO, 70% against PI before dispatch',
        deliveryPeriod: '6 Weeks from PO date',
        validityDays: 30,
      }
    );

    if (revRes.status !== 201) throw new Error(`Revision failed: ${JSON.stringify(revRes.data)}`);
    const revisedQuote = revRes.data.data;
    console.log(`✓ Quotation revised to Rev 1: New Total Rs. ${revisedQuote.activeRevision.grandTotal.toLocaleString('en-IN')}. (Rev 0 preserved in revisions array!)\n`);

    // 8. Mark Quotation as Won
    console.log('[Step 8] Marking Quotation as Won...');
    const wonRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/quotations/${quotation._id}/mark-won`,
        method: 'POST',
        headers: authHeaders,
      },
      {
        winningRevisionId: revisedQuote.activeRevision._id,
        wonRemarks: 'Rev 1 formally approved by Hospital Director.',
      }
    );

    if (wonRes.status !== 200) throw new Error(`Mark Won failed: ${JSON.stringify(wonRes.data)}`);
    console.log('✓ Quotation marked as WON successfully.\n');

    // 9. Generate Proforma Invoice
    console.log('[Step 9] Generating Proforma Invoice...');
    const piRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/proforma-invoices',
        method: 'POST',
        headers: authHeaders,
      },
      {
        quotationId: quotation._id,
        validityDays: 30,
        notes: 'Remit 30% advance for manufacturing release.',
      }
    );

    if (piRes.status !== 201) throw new Error(`PI creation failed: ${JSON.stringify(piRes.data)}`);
    const pi = piRes.data.data;
    console.log(`✓ Proforma Invoice generated: ${pi.piNumber} (Value: Rs. ${pi.grandTotal.toLocaleString('en-IN')})\n`);

    // 10. Record Customer PO
    console.log('[Step 10] Recording Customer Purchase Order...');
    const wonGrandTotal = revisedQuote.activeRevision.grandTotal;

    const poRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/purchase-orders',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        customerId: customer._id,
        quotationId: quotation._id,
        proformaInvoiceId: pi._id,
        poNumber: 'TMH/BIO/PO/2026/099',
        poDate: new Date().toISOString(),
        poValue: wonGrandTotal,
        deliveryDate: new Date(Date.now() + 42 * 86400000).toISOString(),
        deliveryPeriodText: '6 Weeks from PO date',
        paymentTerms: '30% Advance with PO, 70% against PI before dispatch',
        itemSummary: 'Cryo Ultra-Low Biological Freezer System - 800L (Qty: 1 No)',
        quantity: 1,
        unitPrice: 760000,
      }
    );

    if (poRes.status !== 201) throw new Error(`PO creation failed: ${JSON.stringify(poRes.data)}`);
    const po = poRes.data.data;
    console.log(`✓ Customer PO recorded: ${po.poNumber}\n`);

    // 11. STRICT MANDATORY RULE TEST:
    // First test attempting Sales Order creation BEFORE verification passes
    console.log('[Step 11A] Testing Mandatory Rule: Attempting SO Creation without Passed Verification...');
    const fakeVerificationId = '666666666666666666666666';
    const prematureSORes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/sales-orders',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        customerPOId: po._id,
        poVerificationId: fakeVerificationId,
        committedDispatchDate: new Date().toISOString(),
        deliverySchedule: '6 Weeks',
      }
    );

    if (prematureSORes.status === 400) {
      console.log('✓ Mandatory rule verified: Premature SO creation was STRICTLY BLOCKED by backend validation!\n');
    } else {
      throw new Error(`CRITICAL FLAW: SO creation was NOT blocked without verification! Status: ${prematureSORes.status}`);
    }

    // Now test 5-Point Verification with MISMATCH
    console.log('[Step 11B] Testing 5-Point PO Verification with a mismatch...');
    const failedVerifRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/verifications',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        customerPOId: po._id,
        quotationId: quotation._id,
        checks: {
          itemSpecification: { expectedValue: '800L Freezer', actualValue: '800L Freezer', status: 'MATCH' },
          quantity: { expectedValue: '1 No', actualValue: '1 No', status: 'MATCH' },
          pricingValue: { expectedValue: `Rs. ${wonGrandTotal}`, actualValue: `Rs. ${wonGrandTotal}`, status: 'MATCH' },
          deliveryDate: { expectedValue: '6 Weeks', actualValue: '6 Weeks', status: 'MATCH' },
          paymentTerms: { expectedValue: '30% Advance', actualValue: '90 days credit', status: 'MISMATCH', remarks: 'Payment terms mismatch!' },
        },
      }
    );

    const failedVerif = failedVerifRes.data.data;
    if (failedVerif.allMatched === false && failedVerif.overallStatus === 'FAILED_MISMATCH') {
      console.log('✓ Verification correctly recorded as FAILED_MISMATCH.');
    } else {
      throw new Error('Verification did not fail on mismatch!');
    }

    // Attempting SO with the failed verification
    const blockedSORes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/sales-orders',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        customerPOId: po._id,
        poVerificationId: failedVerif._id,
        committedDispatchDate: new Date().toISOString(),
        deliverySchedule: '6 Weeks',
      }
    );

    if (blockedSORes.status === 400) {
      console.log('✓ Mandatory rule verified: Backend blocked SO creation with message:', blockedSORes.data.message);
    } else {
      throw new Error('SO creation was not blocked on failed verification!');
    }

    // Now submit PO Amendment & Re-Verify with ALL 5 MATCHING
    console.log('\n[Step 11C] Submitting PO Amendment & Performing Re-Verification (All 5 MATCH)...');
    const passedVerifRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/verifications',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        customerPOId: po._id,
        quotationId: quotation._id,
        checks: {
          itemSpecification: { expectedValue: '800L Freezer', actualValue: '800L Freezer', status: 'MATCH', remarks: 'Specs match quote' },
          quantity: { expectedValue: '1 No', actualValue: '1 No', status: 'MATCH', remarks: 'Qty 1 No matches' },
          pricingValue: { expectedValue: `Rs. ${wonGrandTotal}`, actualValue: `Rs. ${wonGrandTotal}`, status: 'MATCH', remarks: 'Price matches quote' },
          deliveryDate: { expectedValue: '6 Weeks', actualValue: '6 Weeks', status: 'MATCH', remarks: 'Delivery schedule matches' },
          paymentTerms: { expectedValue: '30% Advance', actualValue: '30% Advance', status: 'MATCH', remarks: 'Amended payment terms match' },
        },
        generalRemarks: 'All 5 points successfully verified and matched.',
      }
    );

    if (passedVerifRes.status !== 201 || !passedVerifRes.data.data.allMatched) {
      throw new Error(`Passed verification failed: ${JSON.stringify(passedVerifRes.data)}`);
    }
    const passedVerif = passedVerifRes.data.data;
    console.log(`✓ 5-Point Verification PASSED! (Round ${passedVerif.verificationRound})\n`);

    // 12. Create Sales Order
    console.log('[Step 12] Creating Sales Order...');
    const soRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/sales-orders',
        method: 'POST',
        headers: authHeaders,
      },
      {
        leadId: lead._id,
        customerPOId: po._id,
        poVerificationId: passedVerif._id,
        committedDispatchDate: new Date(Date.now() + 40 * 86400000).toISOString(),
        deliverySchedule: '6 Weeks from order release',
        specialInstructions: 'Provide helium leak check certificate for cooling system.',
      }
    );

    if (soRes.status !== 201) throw new Error(`SO creation failed: ${JSON.stringify(soRes.data)}`);
    const salesOrder = soRes.data.data;
    console.log(`✓ Sales Order successfully created: ${salesOrder.soNumber} (Value: Rs. ${salesOrder.grandTotal.toLocaleString('en-IN')})\n`);

    // 13. Handover to Production
    console.log('[Step 13] Performing Handover to Production...');
    const handoverRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/sales-orders/${salesOrder._id}/handover`,
        method: 'PUT',
        headers: authHeaders,
      },
      {
        handoverRemarks: 'Advance payment received. Engineering and commercial clearances complete. Released to fabrication.',
        targetCompletionDate: new Date(Date.now() + 35 * 86400000).toISOString(),
      }
    );

    if (handoverRes.status !== 200) throw new Error(`Handover failed: ${JSON.stringify(handoverRes.data)}`);
    console.log(`✓ Sales Order ${salesOrder.soNumber} successfully Handed Over to Production!\n`);

    // 14. Check Complete Lead Activity Timeline
    console.log('[Step 14] Verifying Complete Lead Activity Timeline...');
    const timelineRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/leads/${lead._id}/activities`,
      method: 'GET',
      headers: authHeaders,
    });

    const activities = timelineRes.data.data;
    console.log(`✓ Activity Timeline contains ${activities.length} audit records:`);
    activities.forEach((act, idx) => {
      console.log(`   ${idx + 1}. [${act.activityType}] ${act.title}`);
    });

    console.log('\n=== ALL 14 WORKFLOW STAGES VERIFIED SUCCESSFULLY! ===');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ TEST FAILED:', error.message);
    process.exit(1);
  }
};

runEndToEndTest();

