"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Smartphone, Building2, CreditCard, AlertCircle, Upload, X, CheckCircle2, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import type { Course } from "@/lib/types"

interface CheckoutFormProps {
  course: Course
  userId: string
}

type PaymentMethod = "vodafone_cash" | "instapay" | "visa"

export function CheckoutForm({ course, userId }: CheckoutFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { t, language } = useTranslation() // Corrected variable declaration

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

  const removeScreenshot = () => {
    setScreenshotFile(null)
    setScreenshotPreview(null)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
  }

  const getPaymentMethods = () => [
    {
      id: "vodafone_cash" as const,
      name: t.vodafoneTitle,
      icon: Smartphone,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: t.vodafoneDesc,
      instructions: [t.vodafoneStep1, t.vodafoneStep2, t.vodafoneStep3, t.vodafoneStep4, t.vodafoneStep5],
      merchantNumber: "01099249706",
    },
    {
      id: "instapay" as const,
      name: t.instaPayTitle,
      icon: Building2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      description: t.instaPayDesc,
      instructions: [t.instaPayStep1, t.instaPayStep2, t.instaPayStep3, t.instaPayStep4, t.instaPayStep5],
      ipaAddress: "yomnahelkholyy@instapay",
    },
    {
      id: "visa" as const,
      name: t.visaTitle,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: t.visaDesc,
      instructions: [t.visaStep1, t.visaStep2, t.visaStep3, t.visaStep4, t.visaStep5],
    },
  ]

  const paymentMethodsList = getPaymentMethods()
  const selectedPayment = paymentMethodsList.find((method) => method.id === selectedMethod)

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshotFile(file)
      setScreenshotPreview(URL.createObjectURL(file))
    }
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
          <CardTitle className="text-lg">{t.selectPaymentMethod}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
            className="grid gap-4"
          >
            {paymentMethodsList.map((method) => {
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
      {selectedPayment && (
        <Card className={cn(selectedPayment.bgColor, "border-2", selectedPayment.borderColor)}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {selectedPayment.icon && (() => {
                const IconComponent = selectedPayment.icon
                return <IconComponent className={cn("h-5 w-5", selectedPayment.color)} />
              })()}
              {selectedMethod === "vodafone_cash" ? t.vodafoneInstTitle : selectedMethod === "instapay" ? t.instaPayInstTitle : t.visaInstTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount to Pay */}
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">{t.amountToPay}</p>
              <p className="text-3xl font-bold text-primary">EGP {course.price.toFixed(2)}</p>
            </div>

            {/* Payment Details */}
            {selectedMethod === "vodafone_cash" && (
              <div className="bg-background rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground mb-1">{t.sendToMerchant}</p>
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
                <p className="text-sm text-muted-foreground mb-1">{t.instaPayAddress}</p>
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
              <p className="font-medium text-sm">{t.followSteps}</p>
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
                <Label className="block">{t.uploadScreenshot} *</Label>
                <p className="text-sm text-muted-foreground">
                  {t.screenshotDesc}
                </p>
                
                {screenshotPreview ? (
                  <div className="relative">
                    <img src={screenshotPreview || "/placeholder.svg"} alt={t.uploadScreenshot} className="max-h-64 rounded-lg border" />
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
                    <p className="font-medium">{t.clickToUpload}</p>
                    <p className="text-xs text-muted-foreground">{t.fileSize}</p>
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
                  <Label htmlFor="cardholderName">{t.cardholderName} *</Label>
                  <Input
                    id="cardholderName"
                    placeholder={language === "ar" ? "أسمك" : "your name"}
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">{t.cardNumber} *</Label>
                  <Input
                    id="cardNumber"
                    placeholder={language === "ar" ? "1234 5678 9012 3456" : "1234 5678 9012 3456"}
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
                    <Label htmlFor="expiryDate">{t.expiryDate} *</Label>
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
                    <Label htmlFor="cvv">{t.cvv} *</Label>
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
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedMethod === "visa" ? t.completePayment : t.confirmPayment}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedMethod !== "visa" && (
            <div className="space-y-2">
              <Label htmlFor="transactionId">
                {selectedMethod === "vodafone_cash" ? t.transactionId : t.referenceNumber} *
              </Label>
              <Input
                id="transactionId"
                placeholder={
                  selectedMethod === "vodafone_cash"
                    ? t.enterTransactionId
                    : t.enterReferenceNumber
                }
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="text-s"
              />
              <p className="text-xs text-muted-foreground">{t.afterPayment}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">{t.phoneNumber} *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="01xxxxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.phoneNumberDesc}</p>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.submit}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {language === "ar" 
              ? "سيتم التحقق من الدفع خلال 1-24 ساعة. ستتلقى بريداً إلكترونياً بمجرد تأكيد التسجيل."
              : "Your payment will be verified within 1-24 hours. You'll receive an email once your enrollment is confirmed."
            }
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
