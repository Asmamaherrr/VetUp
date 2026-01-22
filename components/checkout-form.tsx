"use client"

import type React from "react"
import { id } from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Smartphone, Building2, CreditCard, Copy, CheckCircle2, AlertCircle, Upload, ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Course } from "@/lib/types"

interface CheckoutFormProps {
  course: Course
  userId: string
}

type PaymentMethod = "vodafone_cash" | "instapay" | "visa"

const paymentMethods = [
  {
    id: "vodafone_cash" as const,
    name: "Vodafone Cash",
    icon: Smartphone,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Pay using your Vodafone Cash wallet",
    instructions: [
      "Open Vodafone Cash app or dial *9*6265#",
      "Select 'Pay Bill' or 'Send Money'",
      "Enter merchant number: 01012345678",
      "Enter the exact amount shown",
      "Confirm payment and save the transaction ID",
    ],
    merchantNumber: "01012345678",
  },
  {
    id: "instapay" as const,
    name: "InstaPay",
    icon: Building2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "Bank transfer via InstaPay",
    instructions: [
      "Open your banking app with InstaPay",
      "Select 'Send Money' or 'Transfer'",
      "Enter IPA: courses@instapay",
      "Enter the exact amount shown",
      "Complete the transfer and note the reference number",
    ],
    ipaAddress: "courses@instapay",
  },
  {
    id: "visa" as const,
    name: "Visa Card",
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Pay with your Visa debit or credit card",
    instructions: [
      "Enter your Visa card details below",
      "Fill in cardholder name, card number, and expiry",
      "Enter the 3-digit CVV code",
      "Click 'Complete Payment' to process",
      "You'll receive a payment confirmation email",
    ],
  },
]

export function CheckoutForm({ course, userId }: CheckoutFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("vodafone_cash")
  const [transactionId, setTransactionId] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [cardholderName, setCardholderName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod)!

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setScreenshotFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError("")
    }
  }

  const removeScreenshot = () => {
    setScreenshotFile(null)
    setScreenshotPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedMethod === "vodafone_cash" && !transactionId) {
      setError("Please enter your transaction ID")
      return
    }

    if (selectedMethod === "instapay" && !transactionId) {
      setError("Please enter your reference number")
      return
    }

    if ((selectedMethod === "vodafone_cash" || selectedMethod === "instapay") && !screenshotFile) {
      setError("Please attach a screenshot of the payment transaction")
      return
    }

    if (selectedMethod === "visa") {
      if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
        setError("Please fill in all card details")
        return
      }
      if (cardNumber.replace(/\s/g, "").length !== 16) {
        setError("Card number must be 16 digits")
        return
      }
      if (cvv.length !== 3) {
        setError("CVV must be 3 digits")
        return
      }
    }

    setIsSubmitting(true)

    try {
      let screenshotUrl = null

      if (screenshotFile && (selectedMethod === "vodafone_cash" || selectedMethod === "instapay")) {
        const fileExt = screenshotFile.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("payment-screenshots")
          .upload(`${selectedMethod}/${fileName}`, screenshotFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from("payment-screenshots")
          .getPublicUrl(`${selectedMethod}/${fileName}`)

        screenshotUrl = urlData.publicUrl
      }

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          course_id: course.id,
          amount: course.price,
          payment_method: selectedMethod,
          status: "pending",
          transaction_id: transactionId || (selectedMethod === "visa" ? `visa-${Date.now()}` : null),
          screenshot_url: screenshotUrl,
          metadata: {
            ...(selectedMethod === "visa" && {
              cardholderName,
              cardLast4: cardNumber.slice(-4),
            }),
          },
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      router.push(`/checkout/confirmation?payment_id=${payment.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
            className="grid gap-4"
          >
            {paymentMethods.map((method) => {
              const Icon = method.icon
              const isSelected = selectedMethod === method.id

              return (
                <label
                  key={method.id}
                  className={cn(
                    "relative flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all",
                    isSelected
                      ? `${method.borderColor} ${method.bgColor}`
                      : "border-border hover:border-muted-foreground/30",
                  )}
                >
                  <RadioGroupItem value={method.id} className="mt-1" />
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", method.bgColor)}>
                    <Icon className={cn("h-6 w-6", method.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className={cn(selectedPayment.bgColor, "border-2", selectedPayment.borderColor)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {selectedPayment.icon && <selectedPayment.icon className={cn("h-5 w-5", selectedPayment.color)} />}
            How to Pay with {selectedPayment.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount to Pay */}
          <div className="bg-background rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">EGP {course.price.toFixed(2)}</p>
          </div>

          {/* Payment Details */}
          {selectedMethod === "vodafone_cash" && (
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">Send to Merchant Number</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-mono font-semibold">{selectedPayment.merchantNumber}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedPayment.merchantNumber!, "merchant")}
                >
                  {copied === "merchant" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {selectedMethod === "instapay" && (
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">InstaPay Address (IPA)</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-mono font-semibold">{selectedPayment.ipaAddress}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedPayment.ipaAddress!, "ipa")}
                >
                  {copied === "ipa" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step-by-step Instructions */}
          <div className="space-y-2">
            <p className="font-medium text-sm">Follow these steps:</p>
            <ol className="space-y-2">
              {selectedPayment.instructions.map((instruction, index) => {
                let stepBgColor = "bg-red-600"
                if (selectedMethod === "instapay") stepBgColor = "bg-emerald-600"
                if (selectedMethod === "visa") stepBgColor = "bg-blue-600"

                return (
                  <li key={index} className="flex gap-3 text-sm">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white flex-shrink-0",
                        stepBgColor,
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Screenshot Upload for Vodafone/InstaPay */}
          {(selectedMethod === "vodafone_cash" || selectedMethod === "instapay") && (
            <div className="bg-background rounded-lg p-4 border space-y-3">
              <Label className="block">Payment Screenshot *</Label>
              <p className="text-sm text-muted-foreground">
                Please upload a screenshot showing the successful {selectedMethod === "vodafone_cash" ? "Vodafone Cash" : "InstaPay"} transaction
              </p>
              
              {screenshotPreview ? (
                <div className="relative">
                  <img src={screenshotPreview || "/placeholder.svg"} alt="Payment screenshot" className="max-h-64 rounded-lg border" />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-medium">Click to upload screenshot</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Visa Card Form */}
          {selectedMethod === "visa" && (
            <div className="bg-background rounded-lg p-4 border space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name *</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "").slice(0, 16)
                    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ")
                    setCardNumber(formatted)
                  }}
                  maxLength={19}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (MM/YY) *</Label>
                  <Input
                    id="expiryDate"
                    placeholder="12/25"
                    value={expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "")
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + "/" + value.slice(2, 4)
                      }
                      setExpiryDate(value)
                    }}
                    maxLength={5}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    maxLength={3}
                    type="password"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Payment...
              </>
            ) : (
              "Submit Payment for Verification"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your payment will be verified within 1-24 hours. You&apos;ll receive an email once your enrollment is
            confirmed.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
