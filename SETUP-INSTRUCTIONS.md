# My Pharmacy - Demo App Setup Instructions

This is a demo Next.js 14 pharmacy website with an AI-powered chat feature that integrates with n8n and Mistral AI.

## 🚀 Next.js App Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Features Included

- ✅ **Navigation:** Home, About, Products, Contact pages
- ✅ **Responsive Design:** Built with Tailwind CSS and shadcn/ui
- ✅ **Hero Section:** Welcome message with call-to-action
- ✅ **Product Catalog:** Fake medicines with prices
- ✅ **Contact Form:** Non-functional demo form
- ✅ **Floating Chat:** AI-powered chat assistant

## 🤖 n8n Workflow Setup

### Prerequisites
- n8n instance running (local or cloud)
- Mistral AI API key

### Installation Steps

1. **Import the workflow:**
   - Open your n8n instance
   - Go to "Workflows" → "Import from file"
   - Select the `n8n-pharmacy-chat-workflow.json` file

2. **Configure Mistral AI credentials:**
   - Go to "Credentials" in n8n
   - Add new credential: "Mistral AI API"
   - Enter your Mistral AI API key
   - Name it: `mistral-api-key`

3. **Activate the workflow:**
   - Open the imported workflow
   - Click "Activate" to enable the webhook

4. **Get the webhook URL:**
   - Click on the "Webhook" node
   - Copy the webhook URL (should be like: `http://localhost:5678/webhook/chat`)

5. **Update the Next.js app:**
   - Open `src/components/chat.tsx`
   - Replace the webhook URL in the fetch request with your actual n8n webhook URL

### Workflow Components

- **Webhook Node:** Receives chat messages from the Next.js app
- **Process Input Node:** Formats the user message and chat history
- **AI Agent Node:** Uses Mistral AI to generate responses
- **Memory Node:** Maintains conversation context (last 10 messages)
- **Response Node:** Sends the AI response back to the Next.js app

## 🔧 Configuration

### Chat Memory
The chat system maintains the last 10 messages for context. This is configured in:
- **Next.js:** `src/components/chat.tsx` (line 54)
- **n8n:** Window Buffer Memory node (contextWindowLength: 10)

### Webhook URL
Update the webhook URL in `src/components/chat.tsx`:
```typescript
const response = await fetch('YOUR_N8N_WEBHOOK_URL', {
  // ... rest of the configuration
});
```

## 🎨 Customization

### Styling
- Built with **Tailwind CSS** and **shadcn/ui**
- Modify colors in `tailwind.config.js`
- Update components in `src/components/ui/`

### Content
- **Logo:** Update in `src/components/navigation.tsx`
- **Products:** Modify the products array in `src/app/products/page.tsx`
- **Contact Info:** Update in `src/app/contact/page.tsx`

### AI Assistant
- **System Prompt:** Modify in the n8n workflow "Process Input" node
- **AI Model:** Change in the Mistral AI node configuration
- **Response Length:** Adjust maxTokens in the AI node

## 🚨 Important Notes

### Demo Disclaimer
This is a **demo application** for educational purposes:
- All products and prices are fake
- Contact forms are non-functional
- Medical advice should come from licensed professionals

### Security Considerations
For production use:
- Add proper authentication
- Implement rate limiting
- Validate and sanitize all inputs
- Use HTTPS for all communications
- Store API keys securely

### CORS Configuration
The n8n workflow includes CORS headers for local development. For production:
- Update the allowed origins
- Implement proper CORS policies
- Consider using environment variables

## 📝 Troubleshooting

### Chat Not Working
1. Check if n8n workflow is active
2. Verify the webhook URL is correct
3. Ensure Mistral AI credentials are configured
4. Check browser console for errors

### Styling Issues
1. Ensure Tailwind CSS is properly configured
2. Check if shadcn/ui components are installed
3. Verify CSS imports in `layout.tsx`

### Build Errors
1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript errors with `npm run build`
3. Verify all imports are correct

## 📞 Support

This is a demo project. For questions about:
- **Next.js:** Check the [Next.js documentation](https://nextjs.org/docs)
- **n8n:** Visit the [n8n documentation](https://docs.n8n.io/)
- **Mistral AI:** See the [Mistral AI documentation](https://docs.mistral.ai/)
- **shadcn/ui:** Check the [shadcn/ui documentation](https://ui.shadcn.com/)

---

**Happy coding! 🎉**