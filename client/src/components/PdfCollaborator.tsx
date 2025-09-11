import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { CollabOp, DrawOp, TextOp, ClearOp } from "../types/collab";
import { LocalDataTrack } from "twilio-video";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type Props = {
  localDataTrack: LocalDataTrack | null;
  onRemoteData: (data: CollabOp) => void;
  isNotary: boolean;
  participantInfo: {
    notary: { identity: string; isConnected: boolean; isReady: boolean };
    client: { identity: string; isConnected: boolean; isReady: boolean };
  };
};

export default function PdfCollaborator({ 
  localDataTrack, 
  onRemoteData, 
  isNotary,
  participantInfo 
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<Array<[number, number]>>([]);
  const [drawings, setDrawings] = useState<Map<number, DrawOp[]>>(new Map());
  const [texts, setTexts] = useState<Map<number, TextOp[]>>(new Map());
  const [scale, setScale] = useState(1.5);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);

  // Load sample PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        // Load the sample PDF from public folder
        const response = await fetch('/sample.pdf');
        const pdfData = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (error) {
        console.error("Error loading PDF:", error);
        // Fallback: create a simple canvas with text
        createFallbackDocument();
      }
    };

    loadPdf();
  }, []);

  const createFallbackDocument = () => {
    // Create a fallback document if PDF loading fails
    setTotalPages(1);
    setPdfDoc({ numPages: 1 });
  };

  const renderPage = useCallback(async (pageNum: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;

    try {
      if (pdfDoc && pdfDoc.numPages) {
        // Render actual PDF page
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } else {
        // Render fallback document
        canvas.width = 612 * scale;
        canvas.height = 792 * scale;
        
        // Clear canvas
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw document content
        context.fillStyle = "#000000";
        context.font = "16px Arial";
        context.fillText("APPLICATION FOR CERTIFIED COPY OF BIRTH RECORD", 50, 50);
        context.font = "14px Arial";
        context.fillText("State of California - Health and Human Services Agency", 50, 80);
        context.fillText("California Department of Public Health", 50, 100);
        
        context.font = "12px Arial";
        context.fillText("Preview your document", 50, 140);
        context.fillText("Please read the instructions before completing the application.", 50, 160);
        
        context.fillText("CERTIFICATE TYPE", 50, 200);
        context.fillText("☐ AUTHORIZED COPY (notarized sworn statement required)", 50, 220);
        context.fillText("☐ INFORMATIONAL COPY", 50, 240);
        
        context.fillText("Part 1 - Relationship to Person on Certificate", 50, 280);
        context.fillText("☐ Registrant  ☐ Parent  ☐ Legal Guardian", 50, 300);
        context.fillText("☐ Child  ☐ Spouse  ☐ Law Enforcement", 50, 320);
        context.fillText("☐ Attorney", 50, 340);
        
        context.fillText("Part 2 - Birth Record Information", 50, 380);
        context.fillText("FIRST Name: ________________________", 50, 400);
        context.fillText("MIDDLE Name: _______________________", 50, 420);
        context.fillText("LAST Name: _________________________", 50, 440);
        context.fillText("City of Birth: ______________________", 50, 460);
        context.fillText("County of Birth: ____________________", 50, 480);
        context.fillText("Date of Birth: ______________________", 50, 500);
        
        context.fillText("Part 3 - Applicant Information", 50, 540);
        context.fillText("Applicant Name: ____________________", 50, 560);
        context.fillText("Mailing Address: ___________________", 50, 580);
        context.fillText("Zip Code: __________________________", 50, 600);
        context.fillText("City: ______________________________", 50, 620);
        context.fillText("State/Province: ____________________", 50, 640);
        context.fillText("Country: ___________________________", 50, 660);
        context.fillText("Telephone: ________________________", 50, 680);
        context.fillText("Email Address: ____________________", 50, 700);
        context.fillText("Reason for Request: ________________", 50, 720);
        
        context.fillText("Application Checklist", 50, 760);
        context.fillText("☐ Check/Money Order Enclosed (No Cash)", 50, 780);
        context.fillText("☐ Notarized Sworn Statement Enclosed (if applicable)", 50, 800);
        context.fillText("Number of Copies: _________________", 50, 820);
        
        context.font = "14px Arial";
        context.fillStyle = "#ff0000";
        context.fillText("Cost: $29.00 PER COPY", 50, 860);
        
        context.fillStyle = "#000000";
        context.font = "10px Arial";
        context.fillText("For current processing times, visit: www.cdph.ca.gov", 50, 880);
      }

      // Draw existing drawings for this page
      const pageDrawings = drawings.get(pageNum) || [];
      pageDrawings.forEach(draw => {
        if (draw.type === "draw") {
          context.strokeStyle = draw.color;
          context.lineWidth = draw.strokeWidth;
          context.lineCap = "round";
          context.lineJoin = "round";
          
          context.beginPath();
          draw.path.forEach(([x, y], index) => {
            if (index === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
          });
          context.stroke();
        }
      });

      // Draw existing texts for this page
      const pageTexts = texts.get(pageNum) || [];
      pageTexts.forEach(text => {
        if (text.type === "text") {
          context.fillStyle = text.color;
          context.font = `${text.fontSize}px Arial`;
          context.fillText(text.value, text.x, text.y);
        }
      });

    } catch (error) {
      console.error("Error rendering page:", error);
    }
  }, [pdfDoc, scale, drawings, texts]);

  useEffect(() => {
    renderPage(currentPage);
  }, [currentPage, renderPage]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isNotary) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setIsDrawing(true);
    setDrawingPath([[x, y]]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isNotary) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setDrawingPath(prev => [...prev, [x, y]]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isNotary || !localDataTrack) return;

    const drawOp: DrawOp = {
      type: "draw",
      page: currentPage,
      path: drawingPath,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
    };

    // Update local state
    setDrawings(prev => {
      const newDrawings = new Map(prev);
      const pageDrawings = newDrawings.get(currentPage) || [];
      newDrawings.set(currentPage, [...pageDrawings, drawOp]);
      return newDrawings;
    });

    // Send to remote participant
    localDataTrack.send(JSON.stringify(drawOp));

    setIsDrawing(false);
    setDrawingPath([]);
  };

  const handleRemoteData = (data: CollabOp) => {
    if (data.type === "draw") {
      setDrawings(prev => {
        const newDrawings = new Map(prev);
        const pageDrawings = newDrawings.get(data.page) || [];
        newDrawings.set(data.page, [...pageDrawings, data]);
        return newDrawings;
      });
    } else if (data.type === "text") {
      setTexts(prev => {
        const newTexts = new Map(prev);
        const pageTexts = newTexts.get(data.page) || [];
        newTexts.set(data.page, [...pageTexts, data]);
        return newTexts;
      });
    } else if (data.type === "clear") {
      setDrawings(prev => {
        const newDrawings = new Map(prev);
        newDrawings.set(data.page, []);
        return newDrawings;
      });
      setTexts(prev => {
        const newTexts = new Map(prev);
        newTexts.set(data.page, []);
        return newTexts;
      });
    }

    // Re-render the current page
    renderPage(currentPage);
  };

  // Set up remote data handler
  useEffect(() => {
    onRemoteData(handleRemoteData);
  }, [onRemoteData]);

  const clearPage = () => {
    if (!isNotary || !localDataTrack) return;

    const clearOp: ClearOp = {
      type: "clear",
      page: currentPage,
    };

    // Update local state
    setDrawings(prev => {
      const newDrawings = new Map(prev);
      newDrawings.set(currentPage, []);
      return newDrawings;
    });
    setTexts(prev => {
      const newTexts = new Map(prev);
      newTexts.set(currentPage, []);
      return newTexts;
    });

    // Send to remote participant
    localDataTrack.send(JSON.stringify(clearOp));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          Document Preview
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded"
            >
              ←
            </button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded"
            >
              →
            </button>
          </div>
          
          {isNotary && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-8 h-8 rounded border"
              />
              <input
                type="range"
                min="1"
                max="10"
                value={currentStrokeWidth}
                onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
                className="w-20"
              />
              <button
                onClick={clearPage}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto p-4">
        <div ref={containerRef} className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 shadow-lg"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: isNotary ? 'crosshair' : 'default' }}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-t text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${participantInfo.notary.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Notary: {participantInfo.notary.identity}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${participantInfo.client.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Client: {participantInfo.client.identity}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {isNotary ? 'You can edit this document' : 'Viewing document (read-only)'}
        </div>
      </div>
    </div>
  );
}
