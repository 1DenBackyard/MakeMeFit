"""PDF generation from markdown content."""
import os
from pathlib import Path
from markdown import markdown
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from html.parser import HTMLParser
import re

from app.config import settings


class HTMLStripper(HTMLParser):
    """Simple HTML to text converter."""
    def __init__(self):
        super().__init__()
        self.text = []
    
    def handle_data(self, data):
        self.text.append(data)
    
    def get_text(self):
        return ''.join(self.text)


def strip_html(html):
    """Strip HTML tags from text."""
    s = HTMLStripper()
    s.feed(html)
    return s.get_text()


def markdown_to_pdf(markdown_content: str, output_path: str) -> int:
    """
    Convert markdown content to PDF.
    
    Returns: file size in bytes
    """
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    
    # Convert markdown to HTML
    html = markdown(markdown_content, extensions=['extra', 'nl2br'])
    
    # Create PDF
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor='#1a1a1a',
        spaceAfter=12,
        alignment=TA_LEFT,
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor='#2c3e50',
        spaceAfter=10,
        spaceBefore=12,
        alignment=TA_LEFT,
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor='#333333',
        spaceAfter=8,
        alignment=TA_LEFT,
        leading=14,
    )
    
    # Build story
    story = []
    
    # Parse HTML and convert to PDF elements
    # Simple approach: split by headers and paragraphs
    lines = markdown_content.split('\n')
    current_section = []
    
    for line in lines:
        line = line.strip()
        if not line:
            if current_section:
                text = '\n'.join(current_section)
                # Remove markdown formatting
                text = re.sub(r'^#+\s*', '', text)  # Remove headers
                text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Remove bold
                text = re.sub(r'\*(.*?)\*', r'\1', text)  # Remove italic
                text = re.sub(r'`(.*?)`', r'\1', text)  # Remove code
                
                if text:
                    story.append(Paragraph(text, body_style))
                    story.append(Spacer(1, 0.2*inch))
                current_section = []
            continue
        
        # Check for headers
        if line.startswith('##'):
            if current_section:
                text = '\n'.join(current_section)
                text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
                text = re.sub(r'\*(.*?)\*', r'\1', text)
                if text:
                    story.append(Paragraph(text, body_style))
                    story.append(Spacer(1, 0.1*inch))
                current_section = []
            
            header_text = line.lstrip('#').strip()
            story.append(Paragraph(header_text, heading_style))
            story.append(Spacer(1, 0.1*inch))
        elif line.startswith('#'):
            if current_section:
                text = '\n'.join(current_section)
                text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
                text = re.sub(r'\*(.*?)\*', r'\1', text)
                if text:
                    story.append(Paragraph(text, body_style))
                    story.append(Spacer(1, 0.2*inch))
                current_section = []
            
            header_text = line.lstrip('#').strip()
            story.append(Paragraph(header_text, title_style))
            story.append(Spacer(1, 0.2*inch))
        else:
            current_section.append(line)
    
    # Add remaining content
    if current_section:
        text = '\n'.join(current_section)
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        if text:
            story.append(Paragraph(text, body_style))
    
    # Build PDF
    doc.build(story)
    
    # Return file size
    return os.path.getsize(output_path)
