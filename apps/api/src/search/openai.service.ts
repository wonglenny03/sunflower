import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { CreateCompanyDto } from '../companies/dto/create-company.dto'

@Injectable()
export class OpenAIService {
  private openai: OpenAI

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured. Please set it in your .env file.')
    }
    this.openai = new OpenAI({
      apiKey,
    })
  }

  async searchCompanies(
    country: string,
    keywords: string,
    limit: number = 10,
  ): Promise<CreateCompanyDto[]> {
    const prompt = this.buildPrompt(country, keywords, limit)

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Use gpt-4o for better performance and knowledge
        messages: [
          {
            role: 'system',
            content:
              'You are a professional business information assistant. You provide accurate, real company information based on your knowledge. Always return valid JSON only, no additional text or explanations. The companies you provide must be real, existing companies.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more accurate, factual responses
        max_tokens: 4000, // Increased for more companies
        response_format: { type: 'json_object' }, // Force JSON response
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse JSON response - try direct parse first, then regex fallback
      let parsed: any
      try {
        parsed = JSON.parse(content)
      } catch (parseError) {
        // Fallback: try to extract JSON from markdown or other formatting
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.error('OpenAI response content:', content)
          throw new Error('Invalid JSON response from OpenAI: ' + content.substring(0, 200))
        }
        parsed = JSON.parse(jsonMatch[0])
      }

      const companies: CreateCompanyDto[] = parsed.companies || []
      
      if (!Array.isArray(companies) || companies.length === 0) {
        console.error('OpenAI response structure:', parsed)
        throw new Error('No companies found in OpenAI response')
      }

      return companies.map((company: any) => ({
        companyName: company.companyName || '',
        phone: company.phone || null,
        email: company.email || null,
        website: company.website || null,
        country,
        keywords,
      }))
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to search companies: ' + error.message)
    }
  }

  private buildPrompt(country: string, keywords: string, limit: number): string {
    const countryName = country === 'singapore' ? 'Singapore' : country === 'malaysia' ? 'Malaysia' : country
    
    return `Search for real, existing companies in ${countryName} related to "${keywords}".

Return a JSON object with the following structure:
{
  "companies": [
    {
      "companyName": "Exact company name as it exists in real life",
      "phone": "Phone number with country code (e.g., +65 for Singapore, +60 for Malaysia) or null if not available",
      "email": "Contact email address (info@company.com format) or null if not available",
      "website": "Full website URL (https://www.company.com) or null if not available"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Return exactly ${limit} real companies that actually exist in ${countryName}
2. Companies must be real, established businesses - NOT fictional or made-up
3. Company names must be accurate and match their official business registration
4. Phone numbers must include country code: +65 for Singapore, +60 for Malaysia
5. Email addresses must be in valid format (e.g., info@company.com, contact@company.com)
6. Website URLs must be complete with https://
7. If any field is not publicly available, use null (not empty string)
8. Return ONLY valid JSON, no additional text, explanations, or markdown formatting
9. Focus on well-known, established companies when possible
10. Ensure all information is accurate and up-to-date based on your knowledge

Search for companies in these categories related to "${keywords}":
- Technology companies
- Service providers
- Manufacturing companies
- Trading companies
- Professional services
- Retail businesses
- Any other relevant businesses

Return the JSON object now:`
  }
}

