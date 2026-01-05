
import { GoogleGenAI, Type } from "@google/genai";
import { Device, Alert } from "../types";

export const getSmartInsights = async (devices: Device[], alerts: Alert[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const context = `
      You are an IoT Asset Management Assistant for "Trackify". 
      Current devices: ${JSON.stringify(devices.map(d => ({ name: d.name, status: d.status, battery: d.battery, speed: d.speed, speedLimit: d.speedLimit })))}
      Recent alerts: ${JSON.stringify(alerts.slice(0, 5))}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Based on the device data and alerts, provide 3 short, actionable bullet points for the fleet manager. Focus on safety (speed/SOS) and efficiency (sleep/battery). Keep it under 100 words.",
      config: {
        systemInstruction: "You are a professional IoT analyst. Provide concise, high-value insights.",
        temperature: 0.7,
      }
    });

    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Could not connect to AI advisor. Please check connectivity.";
  }
};
