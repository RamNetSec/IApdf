#!/usr/bin/env python3

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    
    # Create a simple test PDF
    pdf_path = 'test_document.pdf'
    c = canvas.Canvas(pdf_path, pagesize=letter)
    
    # Page 1
    c.drawString(100, 750, 'IApdf Test Document')
    c.drawString(100, 720, 'Page 1 of 3')
    c.drawString(100, 680, 'This is a test document for the IApdf application.')
    c.drawString(100, 650, 'It contains sample text across multiple pages.')
    c.drawString(100, 620, 'You can use this to test PDF processing with AI.')
    c.showPage()
    
    # Page 2  
    c.drawString(100, 750, 'Page 2 - Technical Content')
    c.drawString(100, 720, 'Here we have some technical information:')
    c.drawString(100, 680, '• PDF processing using pdftoppm')
    c.drawString(100, 650, '• AI analysis with OpenRouter API')
    c.drawString(100, 620, '• Electron-based desktop application')
    c.drawString(100, 590, '• Modern web technologies')
    c.showPage()
    
    # Page 3
    c.drawString(100, 750, 'Page 3 - Conclusion')
    c.drawString(100, 720, 'This test document demonstrates:')
    c.drawString(100, 680, '1. Multi-page PDF processing')
    c.drawString(100, 650, '2. Conversational AI context')
    c.drawString(100, 620, '3. Document analysis capabilities')
    c.drawString(100, 590, 'Thank you for testing IApdf!')
    c.save()
    
    print('✅ Test PDF created successfully')
    
except ImportError:
    print('❌ reportlab not available')
    print('💡 Try: pip install reportlab')
except Exception as e:
    print(f'❌ Error creating PDF: {e}')
